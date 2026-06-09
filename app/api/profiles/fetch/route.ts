import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import axios from "axios"

const UPWORK_GRAPHQL = "https://api.upwork.com/graphql"

const PROFILE_QUERY = `
  query MyProfile {
    freelancerProfileByProfileKey(profileKey: "me") {
      fullName
      firstName
      lastName
      portrait {
        portraitUrl
      }
      countryDetails {
        name
      }
      personalData {
        profileTitle
        profileDescription
        profileUrl
        hourlyRate {
          amount
        }
      }
      aggregates {
        totalJobsWorked
        totalHoursWorked
        totalEarnings {
          amount
          currency
        }
        feedbackAsFreelancer {
          score
        }
        topRatedStatus
        risingTalentStatus
        availableNow
      }
      skills {
        edges {
          node {
            prettyName
          }
        }
      }
    }
  }
`

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 })
  }

  const userRow = await pool.query(
    `SELECT upwork_access_token, upwork_token_expiry FROM users WHERE id = $1`,
    [parseInt(userId, 10)]
  )

  if (!userRow.rows[0]?.upwork_access_token) {
    return NextResponse.json({ error: "upwork_not_connected" }, { status: 403 })
  }

  const { upwork_access_token, upwork_token_expiry } = userRow.rows[0]

  if (new Date(upwork_token_expiry) < new Date()) {
    return NextResponse.json({ error: "upwork_token_expired" }, { status: 403 })
  }

  try {
    const { data: json } = await axios.post(
      UPWORK_GRAPHQL,
      { query: PROFILE_QUERY },
      {
        headers: {
          "Authorization": `Bearer ${upwork_access_token}`,
          "Content-Type":  "application/json",
        },
      }
    )

    if (json.errors?.length) {
      throw new Error(json.errors[0].message)
    }

    const p = json.data?.freelancerProfileByProfileKey
    if (!p) throw new Error("No profile data returned")

    const earningsAmount = p.aggregates?.totalEarnings?.amount ?? 0
    const earnings =
      earningsAmount >= 1000
        ? `$${Math.round(earningsAmount / 1000)}K+ earned`
        : earningsAmount > 0
        ? `$${earningsAmount} earned`
        : null

    const jobSuccess = p.aggregates?.feedbackAsFreelancer?.score
      ? Math.round(p.aggregates.feedbackAsFreelancer.score * 100)
      : null

    const profile = {
      profileId:        p.personalData?.profileUrl?.split("/").pop() ?? "",
      name:             p.fullName,
      title:            p.personalData?.profileTitle ?? "",
      description:      p.personalData?.profileDescription ?? "",
      profileUrl:       p.personalData?.profileUrl ?? "",
      location:         p.countryDetails?.name ?? "",
      avatarUrl:        p.portrait?.portraitUrl ?? "",
      rate:             p.personalData?.hourlyRate?.amount ?? 0,
      jobSuccess,
      earnings,
      hasAvailableNow:  p.aggregates?.availableNow ?? false,
      hasTopRated:      p.aggregates?.topRatedStatus === "TOP_RATED" || p.aggregates?.topRatedStatus === "TOP_RATED_PLUS",
      skills:           (p.skills?.edges ?? []).map((e: any) => e.node.prettyName),
      jobsRelatedCount: p.aggregates?.totalJobsWorked ?? null,
      scrapedAt:        new Date().toISOString(),
    }

    return NextResponse.json({ success: true, profile })
  } catch (err) {
    console.error("Upwork profile fetch error:", err)
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 })
  }
}