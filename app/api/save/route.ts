import { NextRequest, NextResponse } from "next/server";
import { index } from "@/lib/pinecone";
import { createEmbedding } from "@/lib/embed";
import { structureFreelancerForVectorDB } from "@/lib/dataStructuring";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    
    const freelancers = Array.isArray(body) ? body : [body];

    
    const records = await Promise.all(
      freelancers.map(async (freelancer) => {
        const { id, embeddingText, metadata } =
          structureFreelancerForVectorDB(freelancer);

        const embedding = await createEmbedding(embeddingText);

        return { id, values: embedding, metadata };
      })
    );

    
    await index.upsert({ records });

    return NextResponse.json({
      success: true,
      saved: records.length,
      ids: records.map((r) => r.id),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}