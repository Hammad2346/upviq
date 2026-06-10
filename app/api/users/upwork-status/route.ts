import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 })
  }

  const res = await pool.query(
    `SELECT upwork_access_token, upwork_token_expiry FROM users WHERE id = $1`,
    [parseInt(userId, 10)]
  )

  const row = res.rows[0]

  const connected =
    !!row?.upwork_access_token &&
    row?.upwork_token_expiry &&
    new Date(row.upwork_token_expiry) > new Date()

  return NextResponse.json({ connected: connected === true })
}