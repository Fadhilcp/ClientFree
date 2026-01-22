import { INotificationRecipient, INotificationRecipientDocument } from "../types/notificationRecipient.type";
import { BaseRepository } from "./base.repository";
import { INotificationRecipientRepository } from "./interfaces/INotificationRecipientRepository";
import notificationRecipientModel from "../models/notificationRecipient.model";
import { Types } from "mongoose";

export class NotificationRecipientRepository 
   extends BaseRepository<INotificationRecipientDocument>
      implements INotificationRecipientRepository {
        
    constructor(){
        super(notificationRecipientModel);
    }

    async insertMany(data: Partial<INotificationRecipient>[]): Promise<void> {

        if(!data.length) return;

        await this.model.insertMany(data, { ordered: false });
    }

    async getUserNotificationsPaginated(
        userId: string | Types.ObjectId,
        page = 1,
        limit = 10
    ): Promise<{
        data: INotificationRecipientDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return this.paginate(
            { userId },
            {
                page,
                limit,
                sort: { createdAt: -1 },
                populate: {
                    path: "notificationId",
                    match: { isDeleted: false },
                },
            }
        );
    }


    async markAsRead(
        notificationId: string,
        userId: string
    ): Promise<INotificationRecipientDocument | null> {
        return this.model.findOneAndUpdate(
            { notificationId, userId },
            { isRead: true, readAt: new Date() },
            { new: true }
        ).populate("notificationId");
    }
}