import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const userId = req.nextUrl.searchParams.get('user_id');

    const result = await pool.query(
      `
      SELECT *
      FROM profile_ai_analyses
      WHERE freelancer_profile_id = $1
      AND user_id = $2
      LIMIT 1
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Analysis not found',
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
        error: 'Failed to fetch analysis',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();

  try {
    const { id } = await params;

    const body = await req.json();

    const {
      user_id,
      overallScore,
      parameters,
      suggestions,
      benchmarks,
    } = body;

    await client.query('BEGIN');

    const existing = await client.query(
      `
      SELECT id
      FROM profile_ai_analyses
      WHERE user_id = $1
      AND freelancer_profile_id = $2
      `,
      [user_id, id]
    );

    let analysisId: number;

    if (existing.rows.length > 0) {
      analysisId = existing.rows[0].id;

      await client.query(
        `
        UPDATE profile_ai_analyses
        SET
          overall_score = $1,

          title_score = $2,
          title_max_score = $3,
          title_percentage = $4,
          title_reasoning = $5,

          overview_score = $6,
          overview_max_score = $7,
          overview_percentage = $8,
          overview_reasoning = $9,

          skills_score = $10,
          skills_max_score = $11,
          skills_percentage = $12,
          skills_reasoning = $13,

          rate_score = $14,
          rate_max_score = $15,
          rate_percentage = $16,
          rate_reasoning = $17,

          engagement_score = $18,
          engagement_max_score = $19,
          engagement_percentage = $20,
          engagement_reasoning = $21,

          suggested_title = $22,
          suggested_overview = $23,

          avg_rate_top_profiles = $24,
          avg_job_success_top = $25,
          top_rated_count_in_top10 = $26,

          updated_at = NOW()

        WHERE id = $27
        `,
        [
          overallScore,

          parameters.titleOptimization.score,
          parameters.titleOptimization.maxScore,
          parameters.titleOptimization.percentage,
          parameters.titleOptimization.reasoning,

          parameters.overviewQuality.score,
          parameters.overviewQuality.maxScore,
          parameters.overviewQuality.percentage,
          parameters.overviewQuality.reasoning,

          parameters.skillTagsCoverage.score,
          parameters.skillTagsCoverage.maxScore,
          parameters.skillTagsCoverage.percentage,
          parameters.skillTagsCoverage.reasoning,

          parameters.ratePositioning.score,
          parameters.ratePositioning.maxScore,
          parameters.ratePositioning.percentage,
          parameters.ratePositioning.reasoning,

          parameters.engagementSignals.score,
          parameters.engagementSignals.maxScore,
          parameters.engagementSignals.percentage,
          parameters.engagementSignals.reasoning,

          suggestions.title.rewritten,
          suggestions.overview.rewritten,

          benchmarks.avgRateTopProfiles,
          benchmarks.avgJobSuccessTop,
          benchmarks.topRatedCountInTop10,

          analysisId,
        ]
      );
    } else {
      const inserted = await client.query(
        `
        INSERT INTO profile_ai_analyses (
          user_id,
          freelancer_profile_id,

          overall_score,

          title_score,
          title_max_score,
          title_percentage,
          title_reasoning,

          overview_score,
          overview_max_score,
          overview_percentage,
          overview_reasoning,

          skills_score,
          skills_max_score,
          skills_percentage,
          skills_reasoning,

          rate_score,
          rate_max_score,
          rate_percentage,
          rate_reasoning,

          engagement_score,
          engagement_max_score,
          engagement_percentage,
          engagement_reasoning,

          suggested_title,
          suggested_overview,

          avg_rate_top_profiles,
          avg_job_success_top,
          top_rated_count_in_top10
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28
        )
        RETURNING id
        `,
        [
          user_id,
          id,

          overallScore,

          parameters.titleOptimization.score,
          parameters.titleOptimization.maxScore,
          parameters.titleOptimization.percentage,
          parameters.titleOptimization.reasoning,

          parameters.overviewQuality.score,
          parameters.overviewQuality.maxScore,
          parameters.overviewQuality.percentage,
          parameters.overviewQuality.reasoning,

          parameters.skillTagsCoverage.score,
          parameters.skillTagsCoverage.maxScore,
          parameters.skillTagsCoverage.percentage,
          parameters.skillTagsCoverage.reasoning,

          parameters.ratePositioning.score,
          parameters.ratePositioning.maxScore,
          parameters.ratePositioning.percentage,
          parameters.ratePositioning.reasoning,

          parameters.engagementSignals.score,
          parameters.engagementSignals.maxScore,
          parameters.engagementSignals.percentage,
          parameters.engagementSignals.reasoning,

          suggestions.title.rewritten,
          suggestions.overview.rewritten,

          benchmarks.avgRateTopProfiles,
          benchmarks.avgJobSuccessTop,
          benchmarks.topRatedCountInTop10,
        ]
      );

      analysisId = inserted.rows[0].id;
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      analysisId,
    });

  } catch (error) {
    await client.query('ROLLBACK');

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save analysis',
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();

  try {
    const { id } = await params;

    const body = await req.json();

    const {
      user_id,
      suggested_title,
      suggested_overview,
    } = body;

    await client.query(
      `
      UPDATE profile_ai_analyses
      SET
        suggested_title = $1,
        suggested_overview = $2,
        updated_at = NOW()
      WHERE freelancer_profile_id = $3
      AND user_id = $4
      `,
      [
        suggested_title,
        suggested_overview,
        id,
        user_id,
      ]
    );

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update analysis',
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}