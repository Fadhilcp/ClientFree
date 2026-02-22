import { IChatDocument } from "types/chat.type";
import { IBaseRepository } from "./IBaseRepository";

export interface IChatRepository extends IBaseRepository<IChatDocument> {
    findUserChatsWithSearch(userId: string, search?: string): Promise<IChatDocument[]>;
};