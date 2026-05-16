"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const jobCategories_1 = require("../constants/jobCategories");
const generateJobPost_1 = require("../utils/generateJobPost");
class AiService {
    constructor() { }
    ;
    async generateJobSuggestion(title) {
        const result = await (0, generateJobPost_1.generateJobPost)(title, [...jobCategories_1.JOB_CATEGORIES], [...jobCategories_1.JOB_SUBCATEGORIES]);

        const cleaned = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        const parsed = JSON.parse(cleaned);
        return parsed;
    }
}
exports.AiService = AiService;
