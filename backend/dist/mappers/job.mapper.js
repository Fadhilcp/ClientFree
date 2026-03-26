"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobMapper = void 0;
const mongoose_1 = require("mongoose");
const client_mapper_1 = require("./client.mapper");
function isUserDocument(obj) {
    return obj && typeof obj === "object" && "_id" in obj && "username" in obj;
}
function isPopulatedSkill(obj) {
    return obj && typeof obj === "object" && "_id" in obj && "name" in obj;
}
class JobMapper {
    static toBaseDTO(job) {
        const clientDoc = job.clientId;
        const clientProfile = (0, client_mapper_1.mapUserToClientDto)(clientDoc);
        return {
            id: job._id.toString(),
            client: (0, client_mapper_1.toClientPublic)(clientProfile),
            title: job.title,
            category: job.category,
            subcategory: job.subcategory,
            skills: job.skills?.map(s => isPopulatedSkill(s)
                ? { id: s._id.toString(), name: s.name }
                : { id: s.toString(), name: "" }) ?? [],
            isVerified: clientDoc.isVerified ?? false,
            duration: job.duration,
            hoursPerDay: job.hoursPerDay,
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
    static toListDTO(job) {
        return this.toBaseDTO(job);
    }
    static toDetailDTO(job) {
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
                if (p instanceof mongoose_1.Types.ObjectId)
                    return null;
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
                        skills: p.freelancerId.skills?.map(s => isPopulatedSkill(s)
                            ? { id: s._id.toString(), name: s.name }
                            : { id: s.toString(), name: "" }) ?? [],
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
                };
            }).filter((p) => p !== null) ?? [],
        };
    }
}
exports.JobMapper = JobMapper;
