import { openai } from "../config/openai";

export async function getEmbedding(text: string): Promise<number[]> {
  console.log("🚀 ~ getEmbedding ~ text:", text)
  if (!text || text.trim().length === 0) return [];

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  console.log("🚀 ~ getEmbedding ~ response:", response)

  return response.data[0].embedding;
}