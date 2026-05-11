import { NextRequest, NextResponse } from "next/server";
import { index } from "@/lib/pinecone";
import { createEmbedding } from "@/lib/embed";

// Expand a short query into prose that mirrors the profile embedding style
function expandQuery(query: string): string {
  return `
    Freelancer profile matching the following requirement: ${query}.
    Skills, experience, tools, and expertise related to: ${query}.
    Professional background and specialization in: ${query}.
  `.trim();
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const expandedQuery = expandQuery(body.query);
  const embedding = await createEmbedding(expandedQuery);

  const results = await index.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
  });

  return NextResponse.json(results.matches);
}