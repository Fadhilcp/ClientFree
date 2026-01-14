import { ISubscriptionDocument } from '../types/subscription.type';
import subscriptionModel from '../models/subscription.model';
import { BaseRepository } from './base.repository';
import { ISubscriptionRepository } from './interfaces/ISubscriptionRepository';
import { ClientSession, Types } from 'mongoose';

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

  async findExpiredActive(): Promise<ISubscriptionDocument[]> {
    return this.model.find({
      status: "active",
      expiryDate: { $lt: new Date() },
    });
  }

  async expireById(subscriptionId: string, session: ClientSession): Promise<void> {
    await this.model.updateOne(
      { _id: subscriptionId },
      { $set: { status: "expired" } },
      { session }
    );
  }
}