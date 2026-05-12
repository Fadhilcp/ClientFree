import { genAiModel } from "../config/generativeAi.config";

export async function generateJobPost(
    title: string,
    categories: string[], 
    subcategories: string[]
): Promise<string> {
    try {
        const prompt = `
            Act as a professional recruitment consultant. 
            A client wants to post a job with the initial title: "${title}".

            IMPORTANT: You MUST select the "category" and "subcategory" from the provided lists below.
            Valid Categories: [${categories.join(", ")}]
            Valid Subcategories: [${subcategories.join(", ")}]

            Provide a structured job post in JSON format with exactly these fields:
            {
              "suggestedTitle": "A refined, professional version of the title (MAX 60 characters)",
              "description": "A detailed, professional job description (2-3 paragraphs) including goals and expectations.",
              "category": "Pick exactly one from the Valid Categories list",
              "subcategory": "Pick exactly one from the Valid Subcategories list",
              "duration": "Estimated deadline date in YYYY-MM-DD format (Target at least 2 weeks from now)",
              "hoursPerDay": "Estimated hours needed per day (Return only the number string, e.g., '4', '8')",
              "paymentBudget": "A realistic fixed price in INR (numbers only as string, e.g., '15000')",
              "paymentType": "Either 'fixed' or 'hourly'"
            }

            Return ONLY the raw JSON.
        `;

        const result = await genAiModel.generateContent(prompt);

        return result.response.text().trim();
    } catch (error) {
        console.error("Error generating job post:", error);
        throw new Error("Failed to generate job post");
    }
}