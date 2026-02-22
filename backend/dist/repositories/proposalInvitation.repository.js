"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalRepository = void 0;
const base_repository_1 = require("./base.repository");
const proposalInvitation_model_1 = __importDefault(require("../models/proposalInvitation.model"));
const mongoose_1 = require("mongoose");
class ProposalRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(proposalInvitation_model_1.default);
    }
    findWithDetail(filter) {
        return this.model.find(filter)
            .populate("freelancerId")
            .populate("jobId");
    }
    async findByJob(filter, page, limit) {
        const mongoFilter = {
            ...filter,
            jobId: new mongoose_1.Types.ObjectId(filter.jobId),
        };
        const skip = (page - 1) * limit;
        const result = await this.model.aggregate([
            { $match: mongoFilter },
            {
                $addFields: {
                    isSponsored: {
                        $eq: ["$optionalUpgrade.name", "sponsored"]
                    }
                }
            },
            { $sort: { isSponsored: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "users",
                                localField: "freelancerId",
                                foreignField: "_id",
                                as: "freelancerId",
                            },
                        },
                        { $unwind: "$freelancerId" },
                        {
                            $lookup: {
                                from: "jobs",
                                localField: "jobId",
                                foreignField: "_id",
                                as: "jobId",
                            },
                        },
                        { $unwind: "$jobId" },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            },
        ]);
        const data = result[0]?.data ?? [];
        const total = result[0]?.totalCount[0]?.count || 0;
        return { proposals: data, total, totalPages: Math.ceil(total / limit) };
    }
    async findWithDetailPaginated(filter, limit) {
        const paginatedFilter = { ...filter };
        return this.model
            .find(paginatedFilter)
            .populate("freelancerId")
            .populate("jobId")
            .sort({ _id: -1 })
            .limit(limit)
            .exec();
    }
}
exports.ProposalRepository = ProposalRepository;
