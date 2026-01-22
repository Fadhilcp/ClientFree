import { Types } from "mongoose";
import { INotificationRecipient, INotificationRecipientDocument } from "../../types/notificationRecipient.type";
import { IBaseRepository } from "./IBaseRepository";

export interface INotificationRecipientRepository extends IBaseRepository<INotificationRecipientDocument>{
    insertMany(data: Partial<INotificationRecipient>[]): Promise<void>;
    getUserNotificationsPaginated(
        userId: string | Types.ObjectId,
        page: number,
        limit: number
    ): Promise<{
        data: INotificationRecipientDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    markAsRead(
        notificationId: string,
        userId: string
    ): Promise<INotificationRecipientDocument | null>;
};