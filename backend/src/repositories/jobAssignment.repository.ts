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
            .populate({ path: "jobId", model: "Jobs" })
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
}