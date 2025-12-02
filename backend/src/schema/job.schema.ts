import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(3).max(120),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  skills: z.array(z.string()).optional(),
  duration: z.string().min(1),
  payment: z.object({
    budget: z.preprocess((val) => Number(val), z.number().positive()),
    type: z.enum(["fixed", "hourly"])   
  }),
  description: z.string().min(20).max(5000),
  visibility: z.enum(["public", "private"]), 
  isFeatured: z.boolean(),
  locationPreference: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    type: z.enum(["specific", "worldwide"])  
  }).refine(val => {
    if (val.type === "specific") {
      return !!val.city && !!val.country;
    }
    return true;
  }, {
    message: "City and country required when location type is 'specific'"
  })
});

export type CreateJobInput = z.infer<typeof createJobSchema>;