"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRepository = void 0;
const base_repository_1 = require("./base.repository");
const job_model_1 = __importDefault(require("../models/job.model"));
class JobRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(job_model_1.default);
    }
    async findWithSkills(filter) {
        return this.model.find(filter).populate("skills", "name _id");
    }
    async findByIdWithDetails(jobId) {
        return this.model.findById(jobId)
            .populate({
            path: "clientId",
            select: [
                "name",
                "username",
                "email",
                "profileImage",
                "location",
                "company",
                "description",
                "isVerified",
            ],
        })
            .populate("skills", "name _id")
            .populate({
            path: "acceptedProposalIds",
            populate: {
                path: "freelancerId",
                model: "User",
                select: [
                    "username",
                    "name",
                    "email",
                    "profileImage",
                    "professionalTitle",
                    "skills",
                    "hourlyRate",
                    "experienceLevel",
                    "stats",
                    "ratings",
                    "isVerified",
                ],
                populate: {
                    path: "skills",
                    model: "Skill",
                    select: "name _id",
                }
            }
        });
    }
    async findWithSkillsPaginated(filter, limit, sort) {
        const paginatedFilter = { ...filter };
        return this.model
            .find(paginatedFilter)
            .populate("clientId", "isVerified")
            .populate("skills", "name _id")
            .sort(sort)
            .limit(limit)
            .exec();
    }
}
exports.JobRepository = JobRepository;
