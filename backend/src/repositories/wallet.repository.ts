import { BaseRepository } from "./base.repository";
import walletModel from "../models/wallet.model";
import { IWalletDocument } from "../types/wallet.type";
import { IWalletRepository } from "./interfaces/IWalletRepository";
import { FilterQuery, PipelineStage } from "mongoose";
import { IUserDocument } from "../types/user.type";

export class WalletRepository 
    extends BaseRepository<IWalletDocument> 
        implements IWalletRepository {

        constructor(){
            super(walletModel)
        }

    async getAllWalletsAggregate(search: string, page: number, limit: number)
    : Promise<{ wallets: (IWalletDocument & {user: IUserDocument})[], total: number, totalPages: number }> {
        const skip = (page - 1) * limit;

        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
        ];

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "user.name": { $regex: search, $options: "i" } },
                        { "user.email": { $regex: search, $options: "i" } },
                    ],
                },
            });
        }

        pipeline.push(
            { $sort: { updatedAt: -1 } },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: "count" }],
                },
            }
        );

        const result = await this.model.aggregate(pipeline);

        const data = result[0]?.data || [];
        const total = result[0]?.totalCount[0]?.count || 0;

        return { wallets: data, total, totalPages: Math.ceil(total / limit) }
    }

    async findOneWithUser(filter: FilterQuery<IWalletDocument>): Promise<IWalletDocument & {userId: IUserDocument} | null> {
        return this.model.findOne(filter)
        .populate("userId", "name email username")
        .lean<IWalletDocument & { userId: IUserDocument }>();
    }
}