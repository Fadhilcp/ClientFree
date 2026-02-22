"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedding = getEmbedding;
const openai_1 = require("../config/openai");
async function getEmbedding(text) {
    if (!text || text.trim().length === 0)
        return [];
    const response = await openai_1.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });
    return response.data[0].embedding;
}
