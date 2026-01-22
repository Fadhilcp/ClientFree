import { INotificationDocument } from "../types/notification.type";
import { BaseRepository } from "./base.repository";
import { INotificationRepository } from "./interfaces/INotificationRepository";
import notificationModel from "../models/notification.model";

export class NotificationRepository 
   extends BaseRepository<INotificationDocument>
      implements INotificationRepository {
        
    constructor(){
        super(notificationModel);
    }
}