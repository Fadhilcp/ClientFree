import z from "zod";

const urlSchema = z
  .string()
  .refine(
    (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid URL" }
  );


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
  hourlyRate: z.number().optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]).optional(),
  professionalTitle: z.string().optional(),
  about: z.string().optional(),

  portfolio: z.array(
    z.object({
      title: z.string(),
      link: urlSchema.optional(),
    })
  ).optional(),

  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      startYear: z.number(),
      endYear: z.number().optional(),
    })
  ).optional(),

  externalLinks: z.array(
    z.object({
      type: z.enum(["github", "linkedin", "website", "dribbble", "behance", "twitter"]),
      url: urlSchema.optional(),
    })
  ).optional(),
});


export const clientUpdateSchema = commonSchema.extend({
    company : z.object({
        name : z.string().optional(),
        industry : z.string().optional(),
        website : urlSchema.optional()
    }).optional(),
});