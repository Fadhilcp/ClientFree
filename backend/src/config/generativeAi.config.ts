import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env.config";

if(!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

const genAi = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const genAiModel = genAi.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
