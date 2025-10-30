import { ISubscriptionDocument } from 'types/subscription.type';
import subscriptionModel from '../models/subscription.model';
import { BaseRepository } from './base.repository';
import { ISubscriptionRepository } from './interfaces/ISubscriptionRepository';

export class SubscriptionRepository 
  extends BaseRepository<ISubscriptionDocument> 
    implements ISubscriptionRepository{
        
    constructor(){
        super(subscriptionModel);
    }
}