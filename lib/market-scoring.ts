import pool from "@/lib/db"
import axios from "axios"

const UPWORK_GRAPHQL     = "https://api.upwork.com/graphql"
const MIN_JOBS_THRESHOLD = 5
const POOL_PAGE_SIZE     = 500
const POOL_TARGET        = 1000

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

const POOL_QUERY = `
  query JobPool($pagination: PageFilterInput!) {
    publicMarketplaceJobPostingsSearch(
      marketPlaceJobFilter: {
        pagination: $pagination
      }
    ) {
      paging {
        total
        count
        offset
      }
      jobs {
        ontologySkills {
          label
        }
      }
    }
  }
`

const PROPOSALS_QUERY = `
  query KeywordProposals($keyword: String!) {
    publicMarketplaceJobPostingsSearch(
      marketPlaceJobFilter: {
        searchExpression_eq: $keyword
      }
    ) {
      facets {
        proposals
      }
    }
  }
`

const MOCK_POOL: Array<{ ontologySkills: Array<{ label: string }> }> = [
  ...Array(142).fill(null).map(() => ({ ontologySkills: [{ label: "React" }] })),
  ...Array(98).fill(null).map(()  => ({ ontologySkills: [{ label: "Python" }] })),
  ...Array(76).fill(null).map(()  => ({ ontologySkills: [{ label: "Node.js" }] })),
  ...Array(61).fill(null).map(()  => ({ ontologySkills: [{ label: "WordPress" }] })),
  ...Array(54).fill(null).map(()  => ({ ontologySkills: [{ label: "Next.js" }] })),
  ...Array(43).fill(null).map(()  => ({ ontologySkills: [{ label: "TypeScript" }] })),
  ...Array(38).fill(null).map(()  => ({ ontologySkills: [{ label: "PHP" }] })),
  ...Array(29).fill(null).map(()  => ({ ontologySkills: [{ label: "Flutter" }] })),
  ...Array(18).fill(null).map(()  => ({ ontologySkills: [{ label: "Vue.js" }] })),
  ...Array(6).fill(null).map(()   => ({ ontologySkills: [{ label: "Webflow" }] })),
  ...Array(435).fill(null).map(() => ({ ontologySkills: [] })),
]

const MOCK_PROPOSALS: Record<string, number> = {
  "react":      41,
  "next.js":    29,
  "node.js":    35,
  "python":     18,
  "typescript": 22,
  "vue.js":     12,
  "php":        44,
  "wordpress":  48,
  "flutter":    16,
  "webflow":    8,
  "default":    20,
}

async function fetchJobPool(): Promise<Array<{ ontologySkills: Array<{ label: string }> }>> {
  if (process.env.UPWORK_MOCK === "true") {
    return MOCK_POOL
  }

  const allJobs: Array<{ ontologySkills: Array<{ label: string }> }> = []

  for (let offset = 0; offset < POOL_TARGET; offset += POOL_PAGE_SIZE) {
    const { data: json } = await axios.post(
      UPWORK_GRAPHQL,
      {
        query: POOL_QUERY,
        variables: {
          pagination: { pageOffset: offset, pageSize: POOL_PAGE_SIZE },
        },
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.UPWORK_ACCESS_TOKEN}`,
          "Content-Type":  "application/json",
        },
      }
    )

    if (json.errors?.length) throw new Error(json.errors[0].message)

    const result = json.data?.publicMarketplaceJobPostingsSearch
    if (!result) throw new Error("No data from Upwork pool query")

    const jobs: Array<{ ontologySkills: Array<{ label: string }> }> = result.jobs ?? []
    allJobs.push(...jobs)

    const total: number = result.paging?.total ?? 0

    if (allJobs.length >= total || jobs.length < POOL_PAGE_SIZE) break

    await new Promise(r => setTimeout(r, 300))
  }

  return allJobs
}

async function fetchAvgProposals(keyword: string): Promise<number> {
  if (process.env.UPWORK_MOCK === "true") {
    return MOCK_PROPOSALS[keyword.toLowerCase()] ?? MOCK_PROPOSALS["default"]
  }

  const { data: json } = await axios.post(
    UPWORK_GRAPHQL,
    { query: PROPOSALS_QUERY, variables: { keyword } },
    {
      headers: {
        "Authorization": `Bearer ${process.env.UPWORK_ACCESS_TOKEN}`,
        "Content-Type":  "application/json",
      },
    }
  )

  if (json.errors?.length) throw new Error(json.errors[0].message)

  const proposalsFacet: Record<string, number> =
    json.data?.publicMarketplaceJobPostingsSearch?.facets?.proposals ?? {}

  let totalWeight = 0
  let weightedSum = 0
  for (const [key, count] of Object.entries(proposalsFacet)) {
    const mid = PROPOSAL_BUCKETS[key]
    if (mid !== undefined && typeof count === "number") {
      weightedSum += mid * count
      totalWeight += count
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

function countKeywordInPool(
  jobs: Array<{ ontologySkills: Array<{ label: string }> }>,
  upworkSkillName: string
): number {
  const needle = upworkSkillName.toLowerCase()
  return jobs.filter(job =>
    job.ontologySkills?.some(s => s.label?.toLowerCase() === needle)
  ).length
}

function demandScore(keywordJobCount: number, totalJobs: number): number {
  if (totalJobs === 0) return 0
  return Math.min(100, Math.round((keywordJobCount / totalJobs) * 100))
}

function competitionScore(avgProposals: number): number {
  return Math.min(100, Math.round((avgProposals / 50) * 100))
}

export async function scoreUserKeywords(
  keywords: Array<{ id: number; user_id: number; keyword: string; upwork_skill_name: string }>
): Promise<KeywordScored[]> {
  const pool_jobs = await fetchJobPool()
  const totalJobs = pool_jobs.length

  const rawResults: KeywordRawData[] = []

  for (const kw of keywords) {
    try {
      const jobCount = countKeywordInPool(pool_jobs, kw.upwork_skill_name)

      let avgProposals = 0
      if (jobCount >= MIN_JOBS_THRESHOLD) {
        avgProposals = await fetchAvgProposals(kw.upwork_skill_name)
        await new Promise(r => setTimeout(r, 300))
      }

      rawResults.push({
        keywordId:       kw.id,
        userId:          kw.user_id,
        keyword:         kw.keyword,
        upworkSkillName: kw.upwork_skill_name,
        rawJobCount:     jobCount,
        avgProposals,
        status:          jobCount < MIN_JOBS_THRESHOLD ? "no_data" : "scored",
      })
    } catch (err) {
      console.error(`Failed scoring "${kw.keyword}":`, err)
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

  const scored: KeywordScored[] = scoreable.map(r => {
    const demand      = demandScore(r.rawJobCount, totalJobs)
    const competition = competitionScore(r.avgProposals)

    /*
     * Opportunity: demand is the base. Competition penalty is scaled DOWN
     * by how high demand is — a React dev with 30 avg proposals still beats
     * a Webflow dev with 3, because React's demand share is 40x larger.
     *
     * penalty = (competition / 100) * 0.6 * (1 - demand / 100)
     *
     * At demand=100 → penalty approaches 0   (competition barely matters)
     * At demand=0   → penalty approaches 0.6 (but score is already 0)
     * At demand=50  → max penalty is 0.3
     */
    const competitionPenalty = (competition / 100) * 0.6 * (1 - demand / 100)

    return {
      ...r,
      demandScore:      demand,
      competitionScore: competition,
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