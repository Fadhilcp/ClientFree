import { JobPostSuggestion } from "../../types/job.type";

export interface IAiService {
    generateJobSuggestion(title: string): Promise<JobPostSuggestion>;
}