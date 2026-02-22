"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobAssignmentRepository = void 0;
const jobAssignment_model_1 = __importDefault(require("../models/jobAssignment.model"));
const base_repository_1 = require("./base.repository");
const mongoose_1 = require("mongoose");
class JobAssignmentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(jobAssignment_model_1.default);
    }
    async findWithJobDetail(filter) {
        return this.model.find(filter)
            .populate({ path: "jobId", model: "Job" });
    }
    async findWithFreelancer(filter) {
        return this.model.find(filter)
            .populate({ path: "freelancerId", model: "User" });
    }
    async findApprovedMilestonesPaginated(filter = {}, options = {}) {
        const page = options.page ?? 1;
        const limit = options.limit ?? 10;
        const skip = (page - 1) * limit;
        const matchStage = {
            $match: {
                ...filter,
                "milestones.status": "approved",
            }
        };
        const pipeline = [
            { $unwind: "$milestones" },
            matchStage,
        ];
        if (options.sort) {
            pipeline.push({ $sort: options.sort });
        }
        pipeline.push({ $skip: skip }, { $limit: limit });
        const dataPromise = this.model.aggregate(pipeline);
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
    async findWithJobDetailPaginated(assignmentFilter, jobFilter, sortQuery, limit) {
        return this.model.aggregate([
            { $match: assignmentFilter },
            {
                $lookup: {
                    from: "jobs",
                    localField: "jobId",
                    foreignField: "_id",
                    as: "job",
                },
            },
            { $unwind: "$job" },
            { $match: jobFilter },
            {
                $lookup: {
                    from: "skills",
                    localField: "job.skills",
                    foreignField: "_id",
                    as: "job.skills",
                },
            },
            { $sort: sortQuery },
            { $limit: limit },
        ]).exec();
    }
    async findApprovedMilestoneDetail(assignmentId, milestoneId) {
        return this.model.findOne({
            _id: assignmentId,
            milestones: {
                $elemMatch: {
                    _id: milestoneId,
                    status: "approved"
                }
            }
        }, {
            jobId: 1,
            freelancerId: 1,
            "milestones.$": 1
        })
            .populate("jobId")
            .populate("freelancerId")
            .populate("milestones.paymentId")
            .exec();
    }
    async getClientMilestones(clientId, page, limit) {
        const skip = (page - 1) * limit;
        const pipeline = [
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
                    "job.clientId": new mongoose_1.Types.ObjectId(clientId)
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
    async findAssignmentsByClient(clientId) {
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
                    "job.clientId": new mongoose_1.Types.ObjectId(clientId)
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
    async countUpcomingClientMilestones(clientId) {
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
                    "job.clientId": new mongoose_1.Types.ObjectId(clientId)
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
    async getPendingClearanceByFreelancer(freelancerId) {
        const result = await this.model.aggregate([
            {
                $match: {
                    freelancerId: new mongoose_1.Types.ObjectId(freelancerId)
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
    async getAllEscrowMilestonesAggregate(search, page, limit) {
        const skip = (page - 1) * limit;
        const matchStage = {};
        if (search) {
            matchStage.$or = [
                { "milestones.title": { $regex: search, $options: "i" } },
            ];
        }
        const pipeline = [
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
        return { milestones: data, total, totalPages: Math.ceil(total / limit) };
    }
}
exports.JobAssignmentRepository = JobAssignmentRepository;
