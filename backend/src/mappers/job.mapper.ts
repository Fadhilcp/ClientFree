import { JobListDTO, JobDetailDTO } from "dtos/job.dto";
import { IJobDocument } from "types/job.type";

export class JobMapper {

    private static toBaseDTO(job: IJobDocument) {
        return {
            id: job._id.toString(),
            clientId: job.clientId.toString(),

            title: job.title,
            category: job.category,
            subcategory: job.subcategory,

            skills: job.skills,

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

            acceptedProposalIds:
                job.acceptedProposalIds?.map(id => id.toString()) ?? [],
        };
    }
}