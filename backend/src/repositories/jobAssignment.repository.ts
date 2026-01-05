import jobAssignmentModel from "../models/jobAssignment.model";
import { IJobAssignmentDocument } from "../types/jobAssignment/jobAssignment.type";
import { IJobAssignmentRepository } from "./interfaces/IJobAssignmentRepository";
import { BaseRepository } from "./base.repository";
import { Aggregate, FilterQuery, PipelineStage, PopulateOptions, Types } from "mongoose";
import { SortOrder } from "mongoose";
import { PopulatedAssignment } from "../types/jobAssignment/jobAssignment.populated";
import { ApprovedMilestoneAssignment } from "../types/jobAssignment/jobAssignment.approvedMilestone";

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

        async getClientMilestones(clientId: string, page: number, limit: number)
        : Promise<{ milestones: IJobAssignmentDocument[], total: number, totalPages: number}> {
            const skip = (page - 1) * limit;

            const pipeline: PipelineStage[] = [
                // join job to verify ownership
                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobId",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                { $unwind: "$job" },

                // client owns the job
                {
                    $match: {
                        "job.clientId": new Types.ObjectId(clientId)
                    }
                },

                // explode milestones
                { $unwind: "$milestones" },

                // shape milestone row
                {
                    $project: {
                        assignmentId: "$_id",
                        jobId: "$jobId",
                        jobTitle: "$job.title",

                        freelancerId: "$freelancerId",

                        milestoneId: "$milestones._id",
                        title: "$milestones.title",
                        amount: "$milestones.amount",
                        status: "$milestones.status",
                        dueDate: "$milestones.dueDate",
                        submittedAt: "$milestones.submittedAt"
                    }
                },

                // pagination + total count
                {
                    $facet: {
                        data: [
                            { $sort: { dueDate: 1, milestoneId: 1 } },
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        total: [
                            { $count: "count" }
                        ]
                    }
                }
            ];

            const result = await this.model.aggregate(pipeline);

            const data = result[0]?.data || [];
            const total = result[0]?.total[0]?.count || 0;

            return { milestones: data, total, totalPages: Math.ceil(total / limit) };
        }

        async findAssignmentsByClient(clientId: string): Promise<{ _id: Types.ObjectId; amount: number; }[]> {
            return this.model.aggregate([
                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobId",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                { $unwind: "$job" },
                {
                    $match: {
                        "job.clientId": new Types.ObjectId(clientId)
                    }
                },
                {
                    $project: {
                        _id: 1,
                        amount: 1
                    }
                }
            ]);
        }

        async countUpcomingClientMilestones(clientId: string): Promise<number> {
            const now = new Date();

            const result = await this.model.aggregate([
                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobId",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                { $unwind: "$job" },
                {
                    $match: {
                        "job.clientId": new Types.ObjectId(clientId)
                    }
                },
                { $unwind: "$milestones" },
                {
                    $match: {
                        "milestones.dueDate": { $gt: now },
                        "milestones.status": {
                        $in: ["draft", "funded", "submitted"]
                        }
                    }
                },
                {
                    $count: "count"
                }
            ]);

            return result[0]?.count || 0;
        }

        async getPendingClearanceByFreelancer(freelancerId: string): Promise<number> {
            const result = await this.model.aggregate([
                {
                    $match: {
                        freelancerId: new Types.ObjectId(freelancerId)
                    }
                },
                { $unwind: "$milestones" },
                {
                    $match: {
                        "milestones.status": {
                        $in: ["funded", "submitted", "approved"]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$milestones.amount" }
                    }
                }
            ]);

            return result[0]?.total ?? 0;
        }

        async getAllEscrowMilestonesAggregate(search: string, page: number, limit: number)
        : Promise<{ milestones: IJobAssignmentDocument[], total: number, totalPages: number }> {

            const skip = (page - 1) * limit;

            const matchStage: any = {};

            if (search) {
                matchStage.$or = [
                    { "milestones.title": { $regex: search, $options: "i" } },
                ];
            }

            const pipeline: PipelineStage[] = [
                { $unwind: "$milestones" },

                {
                    $match: {
                        "milestones.status": {
                            $in: [
                                "funded",
                                "submitted",
                                "approved",
                                "released",
                                "disputed",
                                "refunded",
                            ],
                        },
                        ...matchStage,
                    },
                },

                {
                    $lookup: {
                        from: "payments",
                        localField: "milestones.paymentId",
                        foreignField: "_id",
                        as: "payment",
                    },
                },
                { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "users",
                        localField: "freelancerId",
                        foreignField: "_id",
                        as: "freelancer",
                    },
                },
                { $unwind: "$freelancer" },

                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobId",
                        foreignField: "_id",
                        as: "job",
                    },
                },
                { $unwind: "$job" },
                { $sort: { createdAt: -1 } },

                {
                    $facet: {
                        data: [{ $skip: skip }, { $limit: limit }],
                        totalCount: [{ $count: "count" }],
                    },
                },
            ];

            const result = await this.model.aggregate(pipeline);

            const data = result[0]?.data ?? [];
            const total = result[0]?.totalCount?.[0]?.count ?? 0;

            return { milestones: data, total, totalPages: Math.ceil(total / limit) }
        }
}