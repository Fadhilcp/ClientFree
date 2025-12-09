import { IClarificationMessageDocument } from "types/clarificationMessage";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery } from "mongoose";

export interface IClarificationMessageRepository extends IBaseRepository<IClarificationMessageDocument> {
    createAndPopulate(
            messageData: Partial<IClarificationMessageDocument>
        ): Promise<IClarificationMessageDocument | null>;
    findSortedMessages(filter: FilterQuery<IClarificationMessageDocument>): Promise<IClarificationMessageDocument[]>; 
}