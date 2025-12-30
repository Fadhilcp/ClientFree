import { ISubscriptionDocument } from 'types/subscription.type';
import subscriptionModel from '../models/subscription.model';
import { BaseRepository } from './base.repository';
import { ISubscriptionRepository } from './interfaces/ISubscriptionRepository';
import { Types } from 'mongoose';

export class SubscriptionRepository 
  extends BaseRepository<ISubscriptionDocument> 
    implements ISubscriptionRepository{
        
    constructor(){
        super(subscriptionModel);
    }

    async findOneActiveByUser(userId: string) {
    const now = new Date();

    const subscription = await this.model.findOne({
      userId: new Types.ObjectId(userId),
      status: "active",
      startDate: { $lte: now },
      expiryDate: { $gt: now },
    })
      .populate({
        path: "planId",
        match: { active: true },
      })
      .lean(false);

    if (!subscription || !subscription.planId) {
      return null;
    }

    return subscription;
  }
}