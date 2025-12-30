import { ISubscriptionDocument } from "types/subscription.type";
import { IBaseRepository } from "./IBaseRepository";

export interface ISubscriptionRepository extends IBaseRepository<ISubscriptionDocument>{
    findOneActiveByUser(userId: string): Promise<ISubscriptionDocument | null>;
};
