import { pc } from "./pinecone";

export async function createEmbedding(text: string) {
  const response = await pc.inference.embed({
    model: "llama-text-embed-v2",

    inputs: [text],

    parameters: {
      inputType: "passage",
      truncate: "END",
    },
  });

  const embedding = response.data[0];

  if (embedding.vectorType !== "dense") {
    throw new Error("Expected dense embedding");
  }

  return embedding.values;
}