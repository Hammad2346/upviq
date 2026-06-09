import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import axios from "axios"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code   = searchParams.get("code")
  const userId = searchParams.get("state")
  const error  = searchParams.get("error")

  const appBase = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code || !userId) {
    return NextResponse.redirect(`${appBase}/dashboard/profile?upwork=denied`)
  }

  try {
    const clientId     = process.env.UPWORK_CLIENT_ID!
    const clientSecret = process.env.UPWORK_CLIENT_SECRET!
    const redirectUri  = process.env.UPWORK_REDIRECT_URI!

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const tokenRes = await axios.post(
      "https://www.upwork.com/api/v3/oauth2/token",
      new URLSearchParams({
        grant_type:   "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type":  "application/x-www-form-urlencoded",
        },
      }
    )

    const { access_token, refresh_token, expires_in } = tokenRes.data

    const expiry = new Date(Date.now() + expires_in * 1000).toISOString()

    await pool.query(
      `UPDATE users
       SET upwork_access_token  = $1,
           upwork_refresh_token = $2,
           upwork_token_expiry  = $3
       WHERE id = $4`,
      [access_token, refresh_token, expiry, parseInt(userId, 10)]
    )

    return NextResponse.redirect(`${appBase}/dashboard/profile?upwork=connected`)
  } catch (err) {
    console.error("Upwork OAuth callback error:", err)
    return NextResponse.redirect(`${appBase}/dashboard/profile?upwork=error`)
  }
}