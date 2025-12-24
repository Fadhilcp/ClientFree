import jobAssignmentModel from "models/jobAssignment.model";
import { IJobAssignmentDocument } from "types/jobAssignment/jobAssignment.type";
import { IJobAssignmentRepository } from "./interfaces/IJobAssignmentRepository";
import { BaseRepository } from "./base.repository";
import { FilterQuery, PopulateOptions } from "mongoose";
import { SortOrder } from "mongoose";
import { PopulatedAssignment } from "types/jobAssignment/jobAssignment.populated";
import { ApprovedMilestoneAssignment } from "types/jobAssignment/jobAssignment.approvedMilestone";

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

        async findApprovedMilestonesPaginated(
            filter: FilterQuery<IJobAssignmentDocument> = {},
            options: {
                page?: number;
                limit?: number;
                sort?: Record<string, SortOrder>;
                populate?: PopulateOptions | (string | PopulateOptions)[];
        } = {}
        ): Promise<{
            data: ApprovedMilestoneAssignment[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }> {

            const page = options.page ?? 1;
            const limit = options.limit ?? 10;
            const skip = (page - 1) * limit;

            const matchStage = {
                $match: {
                    ...filter,
                    "milestones.status": "approved",
                }
            };

            const pipeline: any[] = [
                { $unwind: "$milestones" },
                matchStage,
            ];

            if (options.sort) {
                pipeline.push({ $sort: options.sort });
            }

            pipeline.push(
                { $skip: skip },
                { $limit: limit }
            );

            const dataPromise = this.model.aggregate<ApprovedMilestoneAssignment>(pipeline);

            const countPipeline = [
                { $unwind: "$milestones" },
                matchStage,
                { $count: "total" }
            ];

            const countPromise = this.model.aggregate(countPipeline);

            const [data, countResult] = await Promise.all([
                dataPromise.exec(),
                countPromise.exec()
            ]);

            const total = countResult[0]?.total ?? 0;

            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
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

        async findApprovedMilestoneDetail(
            assignmentId: string,
            milestoneId: string
        ): Promise<PopulatedAssignment | null> {
            return this.model.findOne(
                {
                    _id: assignmentId,
                    milestones: {
                        $elemMatch: {
                                _id: milestoneId,
                                status: "approved"
                        }
                    }
                },
                {
                    jobId: 1,
                    freelancerId: 1,
                    "milestones.$": 1
                }
            )
            .populate("jobId")
            .populate("freelancerId")
            .populate("milestones.paymentId")
            .exec() as Promise<PopulatedAssignment | null>;
        }
}