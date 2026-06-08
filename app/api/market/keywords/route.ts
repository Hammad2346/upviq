import { NextRequest, NextResponse } from "next/server"
import  pool  from "@/lib/db"
import { scoreUserKeywords, persistScores } from "@/lib/market-scoring"

export async function GET(req: NextRequest) {
  const userId = parseInt(req.nextUrl.searchParams.get("user_id") ?? "", 10)
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 })

  const { rows } = await pool.query(
    `SELECT
       k.id,
       k.keyword,
       k.upwork_skill_name,
       k.created_at,
       d.demand_score,
       d.competition_score,
       d.opportunity_score,
       d.raw_job_count,
       d.avg_proposals,
       d.data_status,
       d.snapshot_date
     FROM user_tracked_keywords k
     LEFT JOIN LATERAL (
       SELECT *
       FROM keyword_market_data
       WHERE keyword_id = k.id
       ORDER BY snapshot_date DESC
       LIMIT 1
     ) d ON true
     WHERE k.user_id = $1
     ORDER BY d.opportunity_score DESC NULLS LAST, k.created_at ASC`,
    [userId]
  )

  return NextResponse.json({ keywords: rows })
}

export async function POST(req: NextRequest) {
  const body            = await req.json()
  const userId          = parseInt(body.user_id, 10)
  const keyword         = body.keyword?.trim()
  const upworkSkillName = body.upwork_skill_name?.trim()

  if (!userId || !keyword || !upworkSkillName) {
    return NextResponse.json({ error: "user_id, keyword, upwork_skill_name required" }, { status: 400 })
  }

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM user_tracked_keywords WHERE user_id = $1`,
    [userId]
  )
  if (parseInt(countRows[0].cnt, 10) >= 20) {
    return NextResponse.json({ error: "Maximum 20 keywords per account" }, { status: 400 })
  }

  const { rows } = await pool.query(
    `INSERT INTO user_tracked_keywords (user_id, keyword, upwork_skill_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, upwork_skill_name) DO NOTHING
     RETURNING id, keyword, upwork_skill_name, created_at`,
    [userId, keyword, upworkSkillName]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "Already tracking this skill" }, { status: 409 })
  }

  const allKeywords = await pool.query(
    `SELECT id, user_id, keyword, upwork_skill_name FROM user_tracked_keywords WHERE user_id = $1`,
    [userId]
  )

  try {
    const scored = await scoreUserKeywords(allKeywords.rows)
    await persistScores(scored)
  } catch (err) {
    console.error("Initial scoring failed:", err)
  }

  return NextResponse.json({ keyword: rows[0] }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const body   = await req.json()
  const userId = parseInt(body.user_id, 10)
  const id     = parseInt(body.id, 10)

  if (!userId || !id) {
    return NextResponse.json({ error: "user_id and id required" }, { status: 400 })
  }

  const { rowCount } = await pool.query(
    `DELETE FROM user_tracked_keywords WHERE id = $1 AND user_id = $2`,
    [id, userId]
  )

  if (rowCount === 0) {
    return NextResponse.json({ error: "Keyword not found" }, { status: 404 })
  }

  const { rows: remaining } = await pool.query(
    `SELECT id, user_id, keyword, upwork_skill_name FROM user_tracked_keywords WHERE user_id = $1`,
    [userId]
  )

  if (remaining.length > 0) {
    try {
      const scored = await scoreUserKeywords(remaining)
      await persistScores(scored)
    } catch (err) {
      console.error("Re-scoring after delete failed:", err)
    }
  }

  return NextResponse.json({ success: true })
}