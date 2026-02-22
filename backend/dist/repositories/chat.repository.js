"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const base_repository_1 = require("./base.repository");
const chat_model_1 = __importDefault(require("../models/chat.model"));
const mongoose_1 = require("mongoose");
class ChatRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(chat_model_1.default);
    }
    async findUserChatsWithSearch(userId, search) {
        const pipeline = [
            {
                $match: {
                    participants: new mongoose_1.Types.ObjectId(userId),
                },
            },
            {
                // normalize sort field - handles null lastMessageAt
                $addFields: {
                    sortLastMessageAt: {
                        $ifNull: ["$lastMessageAt", "$createdAt"],
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "participants",
                    foreignField: "_id",
                    as: "participants",
                },
            },
            {
                $lookup: {
                    from: "jobs",
                    localField: "jobId",
                    foreignField: "_id",
                    as: "jobId",
                },
            },
            { $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true } },
        ];
        if (search?.trim()) {
            const words = search.trim().split(/\s+/);
            pipeline.push({
                $match: {
                    $and: words.map(word => ({
                        $or: [
                            { "participants.name": { $regex: word, $options: "i" } },
                            { "participants.username": { $regex: word, $options: "i" } },
                            { "jobId.title": { $regex: word, $options: "i" } },
                        ],
                    })),
                },
            });
        }
        pipeline.push({
            $sort: {
                sortLastMessageAt: -1
            },
        });
        return this.model.aggregate(pipeline);
    }
}
exports.ChatRepository = ChatRepository;
