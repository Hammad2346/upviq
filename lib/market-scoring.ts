import pool from "@/lib/db"
import axios from "axios"

const UPWORK_GRAPHQL    = "https://api.upwork.com/graphql"
const MIN_JOBS_THRESHOLD = 5
const DAYS_POSTED        = 1

const PROPOSAL_BUCKETS: Record<string, number> = {
  "0":  2,
  "5":  7,
  "10": 12,
  "15": 17,
  "20": 30,
  "50": 65,
}

export type DataStatus = "scored" | "no_data"

export interface KeywordRawData {
  keywordId:       number
  userId:          number
  keyword:         string
  upworkSkillName: string
  rawJobCount:     number
  avgProposals:    number
  status:          DataStatus
}

export interface KeywordScored extends KeywordRawData {
  demandScore:      number
  competitionScore: number
  opportunityScore: number
}

const MARKET_QUERY = `
  query MarketData($keyword: String!, $daysPosted: Int!) {
    publicMarketplaceJobPostingsSearch(
      marketPlaceJobFilter: {
        q: $keyword
        daysPosted: $daysPosted
      }
    ) {
      paging {
        total
      }
      facets {
        proposals
      }
    }
  }
`

const MOCK_DATA: Record<string, { totalJobs: number; avgProposals: number }> = {
  default:      { totalJobs: 12,  avgProposals: 18 },
  "react":      { totalJobs: 847, avgProposals: 28 },
  "next.js":    { totalJobs: 412, avgProposals: 22 },
  "node.js":    { totalJobs: 634, avgProposals: 31 },
  "python":     { totalJobs: 920, avgProposals: 35 },
  "typescript": { totalJobs: 380, avgProposals: 19 },
  "vue.js":     { totalJobs: 210, avgProposals: 16 },
  "php":        { totalJobs: 290, avgProposals: 38 },
  "wordpress":  { totalJobs: 540, avgProposals: 42 },
  "flutter":    { totalJobs: 175, avgProposals: 14 },
  "webflow":    { totalJobs: 3,   avgProposals: 0  },
}

async function fetchMarketData(
  keyword: string
): Promise<{ totalJobs: number; avgProposals: number }> {
  if (process.env.UPWORK_MOCK === "true") {
    const key = keyword.toLowerCase()
    return MOCK_DATA[key] ?? MOCK_DATA["default"]
  }

  const { data: json } = await axios.post(
    UPWORK_GRAPHQL,
    { query: MARKET_QUERY, variables: { keyword, daysPosted: DAYS_POSTED } },
    {
      headers: {
        "Authorization": `Bearer ${process.env.UPWORK_ACCESS_TOKEN}`,
        "Content-Type":  "application/json",
      },
    }
  )

  if (json.errors?.length) throw new Error(json.errors[0].message)

  const data = json.data?.publicMarketplaceJobPostingsSearch
  if (!data) throw new Error("No data from Upwork")

  const totalJobs: number                        = data.paging?.total ?? 0
  const proposalsFacet: Record<string, number>   = data.facets?.proposals ?? {}

  // Weighted average across proposal buckets
  // Each bucket key is the lower bound; midpoints approximate the centre of each range
  let totalWeight = 0
  let weightedSum = 0
  for (const [key, count] of Object.entries(proposalsFacet)) {
    const mid = PROPOSAL_BUCKETS[key]
    if (mid !== undefined && typeof count === "number") {
      weightedSum += mid * count
      totalWeight += count
    }
  }

  return {
    totalJobs,
    avgProposals: totalWeight > 0 ? weightedSum / totalWeight : 0,
  }
}

/**
 * Demand: absolute scale capped at 1000 jobs/day (reasonable Upwork ceiling).
 * e.g. react 847 jobs → 85
 */
function absoluteDemand(totalJobs: number): number {
  return Math.min(100, Math.round((totalJobs / 1000) * 100))
}

/**
 * Competition: avg proposals mapped to 0–100.
 * 50+ avg proposals = max competition (100).
 * e.g. 28 proposals → 56
 */
function absoluteCompetition(avgProposals: number): number {
  return Math.min(100, Math.round((avgProposals / 50) * 100))
}

export async function scoreUserKeywords(
  keywords: Array<{ id: number; user_id: number; keyword: string; upwork_skill_name: string }>
): Promise<KeywordScored[]> {
  const rawResults: KeywordRawData[] = []

  for (const kw of keywords) {
    try {
      const { totalJobs, avgProposals } = await fetchMarketData(kw.upwork_skill_name)

      rawResults.push({
        keywordId:       kw.id,
        userId:          kw.user_id,
        keyword:         kw.keyword,
        upworkSkillName: kw.upwork_skill_name,
        rawJobCount:     totalJobs,
        avgProposals:    totalJobs < MIN_JOBS_THRESHOLD ? 0 : avgProposals,
        status:          totalJobs < MIN_JOBS_THRESHOLD ? "no_data" : "scored",
      })
    } catch (err) {
      console.error(`Failed fetching market data for "${kw.keyword}":`, err)
      rawResults.push({
        keywordId:       kw.id,
        userId:          kw.user_id,
        keyword:         kw.keyword,
        upworkSkillName: kw.upwork_skill_name,
        rawJobCount:     0,
        avgProposals:    0,
        status:          "no_data",
      })
    }

    // Avoid hammering the API
    await new Promise(r => setTimeout(r, 300))
  }

  const scoreable = rawResults.filter(r => r.status === "scored")
  const noData    = rawResults.filter(r => r.status === "no_data")

  if (scoreable.length === 0) {
    return rawResults.map(r => ({
      ...r,
      demandScore:      0,
      competitionScore: 0,
      opportunityScore: 0,
    }))
  }

  /*
   * Use ABSOLUTE scales — not relative normalization.
   *
   * Relative normalization (old approach) had two problems:
   *   1. A single keyword always collapsed to 50/50 (min === max edge case).
   *   2. Scores shifted every time a keyword was added/removed, making them
   *      meaningless for comparison over time.
   *
   * Absolute scales give stable, intuitive scores regardless of how many
   * keywords are tracked.
   */
  const scored: KeywordScored[] = scoreable.map((r) => {
    const demand      = absoluteDemand(r.rawJobCount)       // e.g. 847 jobs  → 85
    const competition = absoluteCompetition(r.avgProposals) // e.g. 28 props  → 56
    const competitionPenalty = (competition / 100) * 0.6
    return {
      ...r,
      demandScore:      demand,
      competitionScore: competition,
      // High demand + low competition = high opportunity
      opportunityScore: Math.round(demand * (1 - competitionPenalty)),
    }
  })

  return [
    ...scored,
    ...noData.map(r => ({
      ...r,
      demandScore:      0,
      competitionScore: 0,
      opportunityScore: 0,
    })),
  ]
}

export async function persistScores(scores: KeywordScored[]): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const today = new Date().toISOString().split("T")[0]

    for (const s of scores) {
      await client.query(
        `INSERT INTO keyword_market_data
          (keyword_id, raw_job_count, avg_proposals, demand_score, competition_score, opportunity_score, data_status, snapshot_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (keyword_id, snapshot_date) DO UPDATE SET
           raw_job_count     = EXCLUDED.raw_job_count,
           avg_proposals     = EXCLUDED.avg_proposals,
           demand_score      = EXCLUDED.demand_score,
           competition_score = EXCLUDED.competition_score,
           opportunity_score = EXCLUDED.opportunity_score,
           data_status       = EXCLUDED.data_status,
           updated_at        = NOW()`,
        [
          s.keywordId,
          s.rawJobCount,
          s.avgProposals,
          s.demandScore,
          s.competitionScore,
          s.opportunityScore,
          s.status,
          today,
        ]
      )
    }

    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}