"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRepository = void 0;
const base_repository_1 = require("./base.repository");
const wallet_model_1 = __importDefault(require("../models/wallet.model"));
class WalletRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(wallet_model_1.default);
    }
    async getAllWalletsAggregate(search, page, limit) {
        const skip = (page - 1) * limit;
        const pipeline = [
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
        pipeline.push({ $sort: { updatedAt: -1 } }, {
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }],
            },
        });
        const result = await this.model.aggregate(pipeline);
        const data = result[0]?.data || [];
        const total = result[0]?.totalCount[0]?.count || 0;
        return { wallets: data, total, totalPages: Math.ceil(total / limit) };
    }
    async findOneWithUser(filter) {
        return this.model.findOne(filter)
            .populate("userId", "name email username")
            .lean();
    }
}
exports.WalletRepository = WalletRepository;
