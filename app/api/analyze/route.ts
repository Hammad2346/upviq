import { NextRequest, NextResponse } from "next/server";
import { index } from "@/lib/pinecone";
import { createEmbedding } from "@/lib/embed";
import { structureFreelancerForVectorDB } from "@/lib/dataStructuring";
import { buildScoringPrompt } from "@/lib/analyze/prompts";
import type {
  FreelancerProfile,
  AnalyzeResult,
  ParameterScore,
} from "@/lib/analyze/types";

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY_ANOTHER}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function parseJSON<T>(raw: string): T {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

function computeBenchmarks(topProfiles: FreelancerProfile[]) {
  const avgRate = Math.round(
    topProfiles.reduce((sum, p) => sum + (p.rate ?? 0), 0) / topProfiles.length
  );
  const avgJobSuccess = Math.round(
    topProfiles.reduce((sum, p) => sum + (p.jobSuccess ?? 0), 0) /
      topProfiles.length
  );
  const skillFrequency: Record<string, number> = {};
  topProfiles.forEach((p) =>
    p.skills?.forEach((s) => {
      skillFrequency[s] = (skillFrequency[s] ?? 0) + 1;
    })
  );
  const commonSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill]) => skill);

  return {
    avgRateTopProfiles: avgRate,
    avgJobSuccessTop: avgJobSuccess,
    commonSkillsInTop10: commonSkills,
    topRatedCountInTop10: topProfiles.filter((p) => p.hasTopRated).length,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userProfile: FreelancerProfile = body.profile;

    if (!userProfile?.profileId) {
      return NextResponse.json(
        { success: false, error: "Missing profile or profileId" },
        { status: 400 }
      );
    }

    const { embeddingText } = structureFreelancerForVectorDB(userProfile);
    const embedding = await createEmbedding(embeddingText);

    const searchResults = await index.query({
      vector: embedding,
      topK: 15,
      includeMetadata: true,
    });

    const topProfiles: FreelancerProfile[] = searchResults.matches
      .filter((m) => m.id !== userProfile.profileId)
      .slice(0, 10)
      .map((m) => m.metadata as unknown as FreelancerProfile);

    if (topProfiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "Not enough profiles to benchmark against" },
        { status: 400 }
      );
    }

    const rawScores = await callGroq(buildScoringPrompt(userProfile, topProfiles));
    const scoresData =
      parseJSON<Record<string, { score: number; reasoning: string }>>(rawScores);

    const maxScores: Record<string, number> = {
      titleOptimization: 23,
      overviewQuality: 29,
      skillTagsCoverage: 18,
      ratePositioning: 12,
      engagementSignals: 18,
    };

    const parameters = Object.fromEntries(
      Object.entries(scoresData).map(([key, val]) => {
        const max = maxScores[key] ?? 100;
        return [
          key,
          {
            score: val.score,
            maxScore: max,
            percentage: Math.round((val.score / max) * 100),
            reasoning: val.reasoning,
          } satisfies ParameterScore,
        ];
      })
    ) as AnalyzeResult["parameters"];

    const overallScore = Object.values(parameters).reduce(
      (sum, p) => sum + p.score,
      0
    );

    const result: AnalyzeResult = {
      profileId: userProfile.profileId,
      name: userProfile.name,
      overallScore,
      parameters,
      benchmarks: computeBenchmarks(topProfiles),
    };

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}