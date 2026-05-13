import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT
        p.*,
        COALESCE(
          json_agg(s.skill)
          FILTER (WHERE s.skill IS NOT NULL),
          '[]'
        ) AS skills
      FROM freelancer_profiles p
      LEFT JOIN freelancer_skills s
        ON s.freelancer_profile_id = p.id
      WHERE p.user_id = $1
      GROUP BY p.id
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const freelancerProfileId = parseInt(id, 10);
  if (isNaN(freelancerProfileId)) {
    return NextResponse.json({ error: "Invalid profile id" }, { status: 400 });
  }

  const body = await req.json();
  const { user_id, fields } = body as {
    user_id: number;
    fields: {
      title?: string;
      description?: string;
      skills?: string[];
    };
  };

  if (!user_id || !fields || Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "user_id and at least one field required" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");


    const ownerCheck = await client.query(
      `SELECT id FROM freelancer_profiles WHERE id = $1 AND user_id = $2`,
      [freelancerProfileId, user_id]
    );
    if (ownerCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Profile not found or unauthorized" }, { status: 404 });
    }


    const scalarFields: Record<string, string> = {};
    if (fields.title !== undefined)       scalarFields.title       = fields.title;
    if (fields.description !== undefined) scalarFields.description = fields.description;

    if (Object.keys(scalarFields).length > 0) {
      const setClauses = Object.keys(scalarFields)
        .map((col, i) => `${col} = $${i + 1}`)
        .join(", ");
      const values = Object.values(scalarFields);
      values.push(new Date().toISOString()); 
      values.push(freelancerProfileId);      

      await client.query(
        `UPDATE freelancer_profiles
         SET ${setClauses}, updated_at = $${values.length - 1}
         WHERE id = $${values.length}`,
        values
      );
    }

    if (fields.skills && fields.skills.length > 0) {
      await client.query(
        `DELETE FROM freelancer_skills WHERE freelancer_profile_id = $1`,
        [freelancerProfileId]
      );

      for (const skill of fields.skills) {
        await client.query(
          `INSERT INTO freelancer_skills (freelancer_profile_id, skill) VALUES ($1, $2)`,
          [freelancerProfileId, skill]
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[PATCH /api/profiles/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    client.release();
  }
}