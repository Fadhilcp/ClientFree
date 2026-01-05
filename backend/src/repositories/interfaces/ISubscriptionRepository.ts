import { ISubscriptionDocument } from "../../types/subscription.type";
import { IBaseRepository } from "./IBaseRepository";
import { ClientSession } from "mongoose";

export interface ISubscriptionRepository extends IBaseRepository<ISubscriptionDocument>{
    findOneActiveByUser(userId: string): Promise<ISubscriptionDocument | null>;
    findExpiredActive(): Promise<ISubscriptionDocument[]>;
    expireById(subscriptionId: string, session: ClientSession): Promise<void>;
};
