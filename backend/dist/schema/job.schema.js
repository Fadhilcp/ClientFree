"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobSchema = void 0;
const zod_1 = require("zod");
exports.createJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(120),
    category: zod_1.z.string().min(1),
    subcategory: zod_1.z.string().min(1),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    duration: zod_1.z.string().min(1),
    hoursPerDay: zod_1.z.preprocess((val) => Number(val), zod_1.z.number()
        .min(1, "Minimum 1 hour required")
        .max(24, "Hours cannot exceed 24")),
    payment: zod_1.z.object({
        budget: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().positive()),
        type: zod_1.z.enum(["fixed", "hourly"])
    }),
    description: zod_1.z.string().min(20).max(5000),
    visibility: zod_1.z.enum(["public", "private"]),
    isFeatured: zod_1.z.boolean(),
    locationPreference: zod_1.z.object({
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        type: zod_1.z.enum(["specific", "worldwide"])
    }).refine(val => {
        if (val.type === "specific") {
            return !!val.city && !!val.country;
        }
        return true;
    }, {
        message: "City and country required when location type is 'specific'"
    })
});
