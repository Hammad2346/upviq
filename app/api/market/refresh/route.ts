import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { scoreUserKeywords, persistScores } from "@/lib/market-scoring"

const REFRESH_COOLDOWN_HOURS = 6

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const userId = parseInt(body.user_id, 10)

  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 })

  const { rows: recent } = await pool.query(
    `SELECT MAX(updated_at) AS last_refresh
     FROM keyword_market_data kmd
     JOIN user_tracked_keywords utk ON utk.id = kmd.keyword_id
     WHERE utk.user_id = $1 AND kmd.snapshot_date = CURRENT_DATE`,
    [userId]
  )

  const lastRefresh = recent[0]?.last_refresh
  if (lastRefresh) {
    const hoursSince = (Date.now() - new Date(lastRefresh).getTime()) / 1000 / 60 / 60
    if (hoursSince < REFRESH_COOLDOWN_HOURS) {
      const nextIn = Math.ceil(REFRESH_COOLDOWN_HOURS - hoursSince)
      return NextResponse.json({ error: `Refresh available again in ${nextIn}h` }, { status: 429 })
    }
  }

  const { rows: keywords } = await pool.query(
    `SELECT id, user_id, keyword, upwork_skill_name FROM user_tracked_keywords WHERE user_id = $1`,
    [userId]
  )

  if (keywords.length === 0) {
    return NextResponse.json({ error: "No keywords tracked yet" }, { status: 400 })
  }

  try {
    const scored = await scoreUserKeywords(keywords)
    await persistScores(scored)

    return NextResponse.json({
      success: true,
      keywords_refreshed: scored.length,
    })
  } catch (err) {
    console.error("Manual refresh error:", err)
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 })
  }
}