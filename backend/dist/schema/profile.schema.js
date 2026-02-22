"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientUpdateSchema = exports.freelancerUpdateSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const urlSchema = zod_1.default
    .string()
    .refine((val) => {
    try {
        new URL(val);
        return true;
    }
    catch {
        return false;
    }
}, { message: "Invalid URL" });
const commonSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    phone: zod_1.default.string().optional(),
    description: zod_1.default.string().optional(),
    profileImage: zod_1.default.string().optional(),
    location: zod_1.default.object({
        city: zod_1.default.string().optional(),
        state: zod_1.default.string().optional(),
        country: zod_1.default.string().optional(),
    }).optional(),
});
exports.freelancerUpdateSchema = commonSchema.extend({
    skills: zod_1.default.array(zod_1.default.string()).optional(),
    hourlyRate: zod_1.default.number().optional(),
    experienceLevel: zod_1.default.enum(["beginner", "intermediate", "expert"]).optional(),
    professionalTitle: zod_1.default.string().optional(),
    about: zod_1.default.string().optional(),
    portfolio: zod_1.default.array(zod_1.default.object({
        title: zod_1.default.string(),
        link: urlSchema.optional(),
    })).optional(),
    education: zod_1.default.array(zod_1.default.object({
        degree: zod_1.default.string(),
        institution: zod_1.default.string(),
        startYear: zod_1.default.number(),
        endYear: zod_1.default.number().optional(),
    })).optional(),
    externalLinks: zod_1.default.array(zod_1.default.object({
        type: zod_1.default.enum(["github", "linkedin", "website", "dribbble", "behance", "twitter"]),
        url: urlSchema.optional(),
    })).optional(),
});
exports.clientUpdateSchema = commonSchema.extend({
    company: zod_1.default.object({
        name: zod_1.default.string().optional(),
        industry: zod_1.default.string().optional(),
        website: urlSchema.optional()
    }).optional(),
});
