"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genAiModel = void 0;
const generative_ai_1 = require("@google/generative-ai");
const env_config_1 = require("./env.config");
if (!env_config_1.env.GEMINI_API_KEY)
    throw new Error("GEMINI_API_KEY missing");
const genAi = new generative_ai_1.GoogleGenerativeAI(env_config_1.env.GEMINI_API_KEY);
exports.genAiModel = genAi.getGenerativeModel({ model: "gemini-3-flash-preview" });
