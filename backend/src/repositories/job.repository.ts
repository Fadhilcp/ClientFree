import { IJobDocument } from "../types/job.type";
import { IJobRepository } from "./interfaces/IJobRepository";
import { BaseRepository } from "./base.repository";
import jobModel from "../models/job.model";
import { FilterQuery } from "mongoose";

export class JobRepository 
   extends BaseRepository<IJobDocument>
      implements IJobRepository {
        
    constructor(){
        super(jobModel);
    }

    async findWithSkills(filter: FilterQuery<IJobDocument>): Promise<IJobDocument[]> {
        return this.model.find(filter).populate("skills", "name _id");
    }
    async findByIdWithDetails(jobId: string): Promise<IJobDocument | null> {
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

    async findWithSkillsPaginated(
        filter: FilterQuery<IJobDocument>,
        limit: number,
    ): Promise<IJobDocument[]> {
    const paginatedFilter: FilterQuery<IJobDocument> = { ...filter };

    return this.model
        .find(paginatedFilter)
        .populate("clientId", "isVerified")
        .populate("skills", "name _id")
        .sort({ _id: -1 })
        .limit(limit)
        .exec();
    }
}