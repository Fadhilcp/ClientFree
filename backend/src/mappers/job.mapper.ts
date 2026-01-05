import { JobListDTO, JobDetailDTO, AcceptedProposalDTO } from "../dtos/job.dto";
import { Types } from "mongoose";
import { IJobDocument } from "../types/job.type";
import { ISkillDocument } from "../types/skill.type";

import { IUserDocument } from "../types/user.type";

function isUserDocument(obj: any): obj is IUserDocument {
    return obj && typeof obj === "object" && "_id" in obj && "username" in obj;
}

function isPopulatedSkill(obj: any): obj is ISkillDocument {
    return obj && typeof obj === "object" && "_id" in obj && "name" in obj;
}


export class JobMapper {

    private static toBaseDTO(job: IJobDocument) {

        const client = job.clientId as unknown as IUserDocument;

        return {
            id: job._id.toString(),
            clientId: client._id.toString(),

            title: job.title,
            category: job.category,
            subcategory: job.subcategory,

            skills: job.skills?.map(s =>
            isPopulatedSkill(s) 
                ? { id: s._id.toString(), name: s.name }
                : { id: s.toString(), name: "" }
            ) ?? [],

            isVerified: client.isVerified ?? false,

            duration: job.duration,

            payment: job.payment
                ? {
                      budget: job.payment.budget,
                      type: job.payment.type,
                  }
                : undefined,

            description: job.description,

            visibility: job.visibility,
            status: job.status,

            proposalCount: job.proposalCount,
            isFeatured: job.isFeatured,

            createdAt: job.createdAt?.toISOString() ?? "",
            updatedAt: job.updatedAt?.toISOString() ?? "",
        };
    }

    static toListDTO(job: IJobDocument): JobListDTO {
        return this.toBaseDTO(job);
    }

    static toDetailDTO(job: IJobDocument): JobDetailDTO {
        return {
            ...this.toBaseDTO(job),

            locationPreference: job.locationPreference
                ? {
                    city: job.locationPreference.city,
                    country: job.locationPreference.country,
                    type: job.locationPreference.type,
                }
                : undefined,

            proposals: job.proposals?.map(p => p.toString()) ?? [],
            isMultiFreelancer: job.isMultiFreelancer,

            acceptedProposals: job.acceptedProposalIds?.map(p => {
        if (p instanceof Types.ObjectId) return null; 

        const freelancer = isUserDocument(p.freelancerId)
            ? {
                id: p.freelancerId._id.toString(),
                email: p.freelancerId.email,
                username: p.freelancerId.username,
                name: p.freelancerId.name,
                profileImage: p.freelancerId.profileImage,
                professionalTitle: p.freelancerId.professionalTitle,
                hourlyRate: p.freelancerId.hourlyRate,
                experienceLevel: p.freelancerId.experienceLevel,
                isVerified: p.freelancerId.isVerified,
                skills: p.freelancerId.skills?.map(s => 
                isPopulatedSkill(s)
                    ? { id: s._id.toString(), name: s.name }
                    : { id: s.toString(), name: "" }
            ) ?? [],
                        stats: p.freelancerId.stats,
                        ratings: p.freelancerId.ratings
                    }
                    : null;

                return {
                    id: p._id.toString(),
                    bidAmount: p.bidAmount,
                    duration: p.duration,
                    status: p.status,
                    freelancer
                } as AcceptedProposalDTO;
            }).filter((p): p is AcceptedProposalDTO => p !== null) ?? [],
        };
    }
}