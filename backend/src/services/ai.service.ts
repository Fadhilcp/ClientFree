import { JOB_CATEGORIES, JOB_SUBCATEGORIES } from "../constants/jobCategories";
import { JobPostSuggestion } from "../types/job.type";
import { generateJobPost } from "../utils/generateJobPost";
import { IAiService } from "./interface/IAiService";

export class AiService implements IAiService {
    constructor(){};

    async generateJobSuggestion(title: string): Promise<JobPostSuggestion> {

        const result = await generateJobPost(title, [...JOB_CATEGORIES], [...JOB_SUBCATEGORIES]);
        console.log("🚀 ~ AiService ~ generateJobSuggestion ~ result:", result)

        const cleaned = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed: JobPostSuggestion = JSON.parse(cleaned);

        return parsed;
    }
}