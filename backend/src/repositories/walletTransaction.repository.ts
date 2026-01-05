import { BaseRepository } from "./base.repository";
import walletTransactionModel from "../models/walletTransaction.model";
import { IWalletTransactionDocument } from "../types/walletTransaction.type";
import { IWalletTransactionRepository } from "./interfaces/IWalletTransactionRepository";
import { Aggregate, FilterQuery, PipelineStage, Types } from "mongoose";
import { FinancialReportSummary } from "../types/wallet.type";

export class WalletTransactionRepository 
    extends BaseRepository<IWalletTransactionDocument> 
        implements IWalletTransactionRepository {

        constructor(){
            super(walletTransactionModel)
        }

        async countTransactions(filter: FilterQuery<IWalletTransactionDocument>): Promise<number> {
           return this.model.countDocuments(filter)
        }

        async aggregateFinancialReport(walletId: string, from: Date, to: Date): Promise<FinancialReportSummary[]> {

            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        walletId: new Types.ObjectId(walletId),
                        status: "completed",
                        createdAt: { $gte: from, $lte: to }
                    }
                },
                {
                    $facet: {
                        freelancer: [
                            {
                                $group: {
                                    _id: null,
                                    totalEarned: {
                                        $sum: {
                                            $cond: [
                                                { $and: [
                                                    { $eq: ["$type", "escrow_release"] },
                                                    { $eq: ["$direction", "credit"] }
                                                ]},
                                                "$amount",
                                                0
                                            ]
                                        }
                                    },
                                    withdrawn: {
                                        $sum: {
                                            $cond: [
                                            { $and: [
                                                { $eq: ["$type", "withdrawal"] },
                                                { $eq: ["$direction", "debit"] }
                                            ]},
                                            "$amount",
                                            0
                                            ]
                                        }
                                        },
                                        platformFees: {
                                        $sum: {
                                            $cond: [
                                                { $and: [
                                                    { $eq: ["$type", "fee"] },
                                                    { $eq: ["$direction", "debit"] }
                                                ]},
                                                "$amount",
                                                0
                                            ]
                                        }
                                    }
                                }
                            }
                        ],
                    client: [
                        {
                        $group: {
                            _id: null,
                            totalSpent: {
                            $sum: {
                                $cond: [
                                { $and: [
                                    { $in: ["$type", ["escrow_hold", "payment"]] },
                                    { $eq: ["$direction", "debit"] }
                                ]},
                                "$amount",
                                0
                                ]
                            }
                            },
                            refunded: {
                            $sum: {
                                $cond: [
                                { $and: [
                                    { $eq: ["$type", "refund"] },
                                    { $eq: ["$direction", "credit"] }
                                ]},
                                "$amount",
                                0
                                ]
                            }
                            }
                        }
                        }
                    ],
                    latestBalance: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                        {
                        $project: {
                            escrow: "$balanceAfter.escrow"
                        }
                        }
                    ]
                    }
                },
                {
                    $project: {
                    freelancer: { $arrayElemAt: ["$freelancer", 0] },
                    client: { $arrayElemAt: ["$client", 0] },
                    inEscrow: { $arrayElemAt: ["$latestBalance.escrow", 0] }
                    }
                }
            ];

            return this.model.aggregate(pipeline).exec();
        }

        async aggregateEscrowByAssignments(
            assignmentIds: Types.ObjectId[]
        ): Promise<{ _id: "escrow_hold" | "escrow_release"; total: number; }[]> {

            if (!assignmentIds.length) return [];

            return this.model.aggregate([
                {
                    $match: {
                        jobAssignmentId: { $in: assignmentIds },
                        type: { $in: ["escrow_hold", "escrow_release"] },
                        status: "completed"
                    }
                },
                {
                    $group: {
                        _id: "$type",
                        total: { $sum: "$amount" }
                    }
                }
            ]);
        }

        async getTotalReleasedByClient(userId: string): Promise<number> {
            const result = await this.model.aggregate([
                {
                    $match: {
                        userId: new Types.ObjectId(userId),
                        type: "escrow_release",
                        direction: "debit",
                        status: "completed"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            return result[0]?.total || 0;
        }

        async getClientPaymentGraph(userId: string): Promise<Aggregate<IWalletTransactionDocument[]>> {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const data = await this.model.aggregate([
                {
                    $match: {
                        userId: new Types.ObjectId(userId),
                        createdAt: { $gte: sixMonthsAgo },
                        type: { $in: ["escrow_hold", "escrow_release"] }
                    }
                },
                {
                    $group: {
                        _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                        type: "$type"
                        },
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            return data;
        }

        async getClientPendingPayments(clientId: string): Promise<number> {
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
                        "milestones.status": "draft"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$milestones.amount" }
                    }
                }
            ]);

            return result[0]?.total || 0;
        }

        async getUpcomingClientMilestones(clientId: string): Promise<number> {
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

        async getTotalEarnedByFreelancer(userId: string): Promise<number> {
            const result = await this.model.aggregate([
                {
                    $match: {
                        userId: new Types.ObjectId(userId),
                        type: "escrow_release",
                        direction: "credit",
                        status: "completed"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            return result[0]?.total || 0;
        }

        async getTotalWithdrawnByFreelancer(userId: string): Promise<number> {
            const result = await this.model.aggregate([
                {
                    $match: {
                        userId: new Types.ObjectId(userId),
                        type: "withdrawal",
                        direction: "debit",
                        status: "completed"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            return result[0]?.total || 0;
        }

        async getFreelancerEarningGraph(userId: string): Promise<Aggregate<IWalletTransactionDocument[]>> {
            return this.model.aggregate([
                {
                    $match: {
                        userId: new Types.ObjectId(userId),
                        direction: "credit",
                        type: "escrow_release",  
                        status: "completed"
                    }
                },
                {
                    $group: {
                        _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                        },
                        total: { $sum: "$amount" }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1
                    }
                }
            ]);
        }

}