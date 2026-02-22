import { openai } from "../config/openai";

export async function getEmbedding(text: string): Promise<number[]> {

  if (!text || text.trim().length === 0) return [];

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}