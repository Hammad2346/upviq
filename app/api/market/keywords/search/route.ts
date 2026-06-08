import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

const UPWORK_GRAPHQL = "https://api.upwork.com/graphql"

const ONTOLOGY_SEARCH_QUERY = `
  query SkillSearch($prefLabel: String!) {
    ontologyElementsSearchByPrefLabel(prefLabel: $prefLabel) {
      id
      prefLabel
    }
  }
`

const MOCK_SKILLS = [
  { id: "1",  prefLabel: "React" },
  { id: "2",  prefLabel: "React Native" },
  { id: "3",  prefLabel: "Next.js" },
  { id: "4",  prefLabel: "TypeScript" },
  { id: "5",  prefLabel: "JavaScript" },
  { id: "6",  prefLabel: "Node.js" },
  { id: "7",  prefLabel: "Python" },
  { id: "8",  prefLabel: "Django" },
  { id: "9",  prefLabel: "FastAPI" },
  { id: "10", prefLabel: "GraphQL" },
  { id: "11", prefLabel: "REST API" },
  { id: "12", prefLabel: "Tailwind CSS" },
  { id: "13", prefLabel: "CSS" },
  { id: "14", prefLabel: "HTML" },
  { id: "15", prefLabel: "Vue.js" },
  { id: "16", prefLabel: "Angular" },
  { id: "17", prefLabel: "PostgreSQL" },
  { id: "18", prefLabel: "MongoDB" },
  { id: "19", prefLabel: "Redis" },
  { id: "20", prefLabel: "Docker" },
  { id: "21", prefLabel: "AWS" },
  { id: "22", prefLabel: "Figma" },
  { id: "23", prefLabel: "UI/UX Design" },
  { id: "24", prefLabel: "Web Performance" },
  { id: "25", prefLabel: "SEO" },
]

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  // ── Mock mode ──────────────────────────────────────────────
  if (process.env.UPWORK_MOCK === "true") {
    const results = MOCK_SKILLS
      .filter((s) => s.prefLabel.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 8)
      .map((s) => ({ id: s.id, label: s.prefLabel, value: s.prefLabel }))
    return NextResponse.json({ results })
  }

  // ── Live Upwork API ────────────────────────────────────────
  const token = process.env.UPWORK_ACCESS_TOKEN
  if (!token) {
    console.error("Missing UPWORK_ACCESS_TOKEN env var")
    return NextResponse.json({ results: [], error: "Missing API token" }, { status: 500 })
  }

  try {
    const { data: json } = await axios.post(
      UPWORK_GRAPHQL,
      { query: ONTOLOGY_SEARCH_QUERY, variables: { prefLabel: q } },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    const skills = json.data?.ontologyElementsSearchByPrefLabel ?? []
    if (!Array.isArray(skills)) return NextResponse.json({ results: [] })

    const results = skills
      .slice(0, 10)
      .map((s: { id: string; prefLabel: string }) => ({
        id:    s.id,
        label: s.prefLabel,
        value: s.prefLabel,
      }))

    return NextResponse.json({ results })
  } catch (err: any) {
    console.error("Skill search error:", err?.response?.data ?? err)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}