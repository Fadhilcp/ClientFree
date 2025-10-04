import z from "zod";

const commonSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  profileImage: z.string().optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
})

export const freelancerUpdateSchema = commonSchema.extend({
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
      url: z.string().url().optional()
    })
  ).optional(),
});


export const clientUpdateSchema = commonSchema.extend({
    company : z.object({
        name : z.string().optional(),
        industry : z.string().optional(),
        website : z.string().optional()
    }).optional(),
});