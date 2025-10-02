import z from "zod";

export const freelancerUpdateSchema = z.object({
  skills: z.array(z.string()).optional(),
  hourlyRate: z.string().optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]).optional(),
  professionalTitle: z.string().optional(),
  about: z.string().optional(),
  portfolio: z.object({
    portfolioFile: z.string().optional(),
    resume: z.string().optional()
  }).optional(),
  externalLinks: z.array(
    z.object({
      type: z.enum(["github", "linkedin", "website", "dribbble", "behance", "twitter"]),
      url: z.string().url()
    })
  ).optional(),
});


export const clientUpdateSchema = z.object({
    company : z.object({
        name : z.string().optional(),
        industry : z.string().optional(),
        website : z.string().optional()
    }).optional(),
});