import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { firebase_uid, name, email } = await req.json()

    if (!firebase_uid || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await pool.query(
      `INSERT INTO users (firebase_uid, name, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (firebase_uid) DO NOTHING`,
      [firebase_uid, name, email]
    )

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("DB error:", error)
    return NextResponse.json(
      { error: "Failed to save user" },
      { status: 500 }
    )
  }
}