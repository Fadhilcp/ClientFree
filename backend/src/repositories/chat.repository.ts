import { IChatDocument } from "types/chat.type";
import { BaseRepository } from "./base.repository";
import { IChatRepository } from "./interfaces/IChatRepository";
import chatModel from "models/chat.model";
import { FilterQuery, PipelineStage } from "mongoose";
import { Types } from "mongoose";

export class ChatRepository 
   extends BaseRepository<IChatDocument>
      implements IChatRepository {
        
    constructor(){
        super(chatModel);
    }

    async findUserChatsWithSearch(userId: string, search?: string): Promise<IChatDocument[]> {
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    participants: new Types.ObjectId(userId),
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
                lastMessageAt: -1,
                updatedAt: -1,
            },
        });

        return this.model.aggregate(pipeline);
    }

}