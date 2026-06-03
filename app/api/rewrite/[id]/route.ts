import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { index } from "@/lib/pinecone";
import { createEmbedding } from "@/lib/embed";
import { structureFreelancerForVectorDB } from "@/lib/dataStructuring";
import { buildSuggestionsPrompt } from "@/lib/analyze/prompts";
import type { FreelancerProfile } from "@/lib/analyze/types";

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  model: "openai/gpt-oss-120b",
  temperature: 0.3,
  response_format: { type: "json_object" },
  messages: [{ role: "user", content: prompt }],
}),
  });

  if (!res.ok) {
  const err = await res.text();
  console.error(`[callGroq] ${res.status} ${res.statusText}:`, err);
  throw new Error(`Groq error ${res.status}: ${err}`);
}

  const data = await res.json();
  return data.choices[0].message.content;
}
async function callDeepSeek(prompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function parseJSON<T>(raw: string): T {
  let cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
 
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error(`No JSON object found in model response: ${cleaned.slice(0, 200)}`);
  }
  cleaned = cleaned.slice(first, last + 1);
 
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    cleaned = cleaned
      .replace(/[\u0000-\u001F\u007F]/g, (ch) => {
        if (ch === "\n") return "\\n";
        if (ch === "\r") return "\\r";
        if (ch === "\t") return "\\t";
        return "";
      });
    return JSON.parse(cleaned) as T;
  }
}


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();

  try {
    const { id } = await params;
    const profileId = parseInt(id, 10);
    const body = await req.json();

    const { user_id, profile, scoring } = body as {
      user_id: number;
      profile: FreelancerProfile;
      scoring: Record<string, { score: number; reasoning: string }>;
    };

    if (!user_id || !profile || !scoring) {
      return NextResponse.json(
        { success: false, error: "Missing user_id, profile, or scoring" },
        { status: 400 }
      );
    }

    const { embeddingText } = structureFreelancerForVectorDB(profile);
    const embedding = await createEmbedding(embeddingText);

    const searchResults = await index.query({
      vector: embedding,
      topK: 15,
      includeMetadata: true,
    });

    const topProfiles: FreelancerProfile[] = searchResults.matches
      .filter((m) => m.id !== profile.profileId)
      .slice(0, 10)
      .map((m) => m.metadata as unknown as FreelancerProfile);

    if (topProfiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "Not enough profiles to benchmark against" },
        { status: 400 }
      );
    }

    const raw = await callGroq(buildSuggestionsPrompt(profile, topProfiles, scoring));
    const suggestions = parseJSON<{
      title: { rewritten: string; reason: string };
      overview: { rewritten: string; reason: string };
      skills: { missing: string[]; reorder: string[]; reason: string };
    }>(raw);

    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id FROM profile_ai_rewrites WHERE user_id = $1 AND freelancer_profile_id = $2`,
      [user_id, profileId]
    );

    let rewriteId: number;

    if (existing.rows.length > 0) {
      rewriteId = existing.rows[0].id;

      await client.query(
        `UPDATE profile_ai_rewrites
         SET
           suggested_title    = $1,
           title_reason       = $2,
           suggested_overview = $3,
           overview_reason    = $4,
           skills_reason      = $5,
           updated_at         = NOW()
         WHERE id = $6`,
        [
          suggestions.title.rewritten,
          suggestions.title.reason,
          suggestions.overview.rewritten,
          suggestions.overview.reason,
          suggestions.skills.reason,
          rewriteId,
        ]
      );

      await client.query(
        `DELETE FROM profile_ai_rewrite_skills WHERE rewrite_id = $1`,
        [rewriteId]
      );
    } else {
      const inserted = await client.query(
        `INSERT INTO profile_ai_rewrites
           (user_id, freelancer_profile_id, suggested_title, title_reason, suggested_overview, overview_reason, skills_reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          user_id,
          profileId,
          suggestions.title.rewritten,
          suggestions.title.reason,
          suggestions.overview.rewritten,
          suggestions.overview.reason,
          suggestions.skills.reason,
        ]
      );

      rewriteId = inserted.rows[0].id;
    }

    const missingValues = suggestions.skills.missing.map((skill, i) => [
      rewriteId,
      skill,
      "missing",
      i,
    ]);
    const reorderValues = suggestions.skills.reorder.map((skill, i) => [
      rewriteId,
      skill,
      "reorder",
      i,
    ]);
    const allSkillRows = [...missingValues, ...reorderValues];

    if (allSkillRows.length > 0) {
      const placeholders = allSkillRows
        .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
        .join(", ");
      await client.query(
        `INSERT INTO profile_ai_rewrite_skills (rewrite_id, skill, skill_type, position) VALUES ${placeholders}`,
        allSkillRows.flat()
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true, rewriteId });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to generate rewrites" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profileId = parseInt(id, 10);
    const userId = req.nextUrl.searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT r.*, 
        json_agg(s ORDER BY s.position) FILTER (WHERE s.id IS NOT NULL) AS skills
       FROM profile_ai_rewrites r
       LEFT JOIN profile_ai_rewrite_skills s ON s.rewrite_id = r.id
       WHERE r.freelancer_profile_id = $1 AND r.user_id = $2
       GROUP BY r.id
       LIMIT 1`,
      [profileId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "No rewrites found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rewrites" },
      { status: 500 }
    );
  }
}