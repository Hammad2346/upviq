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
      WHERE p.id = $1
      GROUP BY p.id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch profile',
      },
      { status: 500 }
    );
  }
}