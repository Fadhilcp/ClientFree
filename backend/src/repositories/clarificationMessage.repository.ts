import { IClarificationMessageDocument } from "types/clarificationMessage";
import { BaseRepository } from "./base.repository";
import { IClarificationMessageRepository } from "./interfaces/IClarificationMessageRepository";
import clarificationMessageModel from "models/clarificationMessage.model";
import { FilterQuery } from "mongoose";

export class ClarificationMessageRepository 
   extends BaseRepository<IClarificationMessageDocument>
      implements IClarificationMessageRepository {
        
    constructor(){
        super(clarificationMessageModel);
    }

    async createAndPopulate(
        messageData: Partial<IClarificationMessageDocument>
    ): Promise<IClarificationMessageDocument | null> {
    const created = await this.model.create(messageData);

    return this.model
        .findById(created._id)
        .populate({
        path: "senderId",
        select: "username name email profileImage role"
        });
    }

    async findSortedMessages(filter: FilterQuery<IClarificationMessageDocument>): Promise<IClarificationMessageDocument[]> {
        return this.model.find(filter)
        .sort({ createdAt: 1 })
        .populate({
            path: "senderId",
            select: "username name email profileImage role"
        })
    }
}