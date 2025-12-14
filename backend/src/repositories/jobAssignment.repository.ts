import jobAssignmentModel from "models/jobAssignment.model";
import { IJobAssignmentDocument } from "types/jobAssignment.type";
import { IJobAssignmentRepository } from "./interfaces/IJobAssignmentRepository";
import { BaseRepository } from "./base.repository";
import { FilterQuery } from "mongoose";

export class JobAssignmentRepository 
    extends BaseRepository<IJobAssignmentDocument> 
        implements IJobAssignmentRepository {

        constructor(){
            super(jobAssignmentModel)
        }

        async findWithJobDetail(filter: FilterQuery<IJobAssignmentDocument>): Promise<IJobAssignmentDocument[] | null> {
            return this.model.find(filter)
            .populate({ path: "jobId", model: "Job" })
        }

        async findWithFreelancer(filter: FilterQuery<IJobAssignmentDocument>): Promise<IJobAssignmentDocument[]> {
            return this.model.find(filter)
            .populate({ path: "freelancerId", model: "User"})
        }

        async findApprovedMilestones(): Promise<IJobAssignmentDocument[]> {
            return this.model.aggregate([
                { $unwind: "$milestones" }, 
                { $match: { "milestones.status": "approved" }}
            ]);
        }

        async findWithJobDetailPaginated(
            filter: FilterQuery<IJobAssignmentDocument>, limit: number
        ): Promise<IJobAssignmentDocument[]> {
            const paginatedFilter: FilterQuery<IJobAssignmentDocument> = { ...filter };

            return this.model.find(paginatedFilter)
            .populate({ 
                path: "jobId", 
                model: "Job",
                populate: {
                    path: "skills",
                    model: "Skill",
                    select: "name _id"
                }
            })
            .sort({ _id: -1 })
            .limit(limit)
            .exec();
        }
}