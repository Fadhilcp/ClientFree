import { Document, Types } from "mongoose";

export interface INotificationRecipient {
  notificationId: Types.ObjectId;
  userId: Types.ObjectId;

  isRead: boolean;

  deliveredViaSocket: boolean;
  deliveredViaEmail: boolean;

  readAt?: Date;
}

export interface INotificationRecipientDocument
  extends INotificationRecipient,
    Document {
  _id: Types.ObjectId;
  createdAt?: Date;
}
