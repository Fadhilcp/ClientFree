import { model, Schema } from "mongoose";
import { INotificationRecipientDocument } from "../types/notificationRecipient.type";

const notificationRecipientSchema = new Schema({
  notificationId: {
    type: Schema.Types.ObjectId,
    ref: 'Notification',
    required: true
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isRead: {
    type: Boolean,
    default: false
  },

  deliveredViaSocket: {
    type: Boolean,
    default: false
  },

  deliveredViaEmail: {
    type: Boolean,
    default: false
  },

  readAt: { type: Date },

}, { timestamps: true });

export default model<INotificationRecipientDocument>('NotificationRecipient', notificationRecipientSchema);