import { IPlanDocument } from "../../types/plan.type";
import { ISubscriptionDocument } from "../../types/subscription.type";
import { IBaseRepository } from "./IBaseRepository";
import { ClientSession } from "mongoose";

export interface ISubscriptionRepository extends IBaseRepository<ISubscriptionDocument>{
    findOneActiveByUser(userId: string): Promise<(ISubscriptionDocument & { planId: IPlanDocument }) | null>;
    findExpiredActive(): Promise<ISubscriptionDocument[]>;
    expireById(subscriptionId: string, session: ClientSession): Promise<void>;
};
