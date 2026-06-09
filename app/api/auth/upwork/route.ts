import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 })
  }

  const clientId    = process.env.UPWORK_CLIENT_ID!
  const redirectUri = process.env.UPWORK_REDIRECT_URI!

  const params = new URLSearchParams({
    response_type: "code",
    client_id:     clientId,
    redirect_uri:  redirectUri,
    state:         userId,
  })

  const upworkAuthUrl = `https://www.upwork.com/ab/account-security/oauth2/authorize?${params.toString()}`

  return NextResponse.redirect(upworkAuthUrl)
}