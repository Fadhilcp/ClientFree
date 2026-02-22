import { model, Schema } from "mongoose";
import { IChatDocument } from "../types/chat.type";

const chatSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    default: null
  },

  status: {
    type: String,
    enum: ['active', 'closed', 'blocked'],
    default: 'active'
  },

  blockReason: {
    type: String,
    enum: ['job_completed', 'subscription_expired', 'manual']
  },

  lastMessageAt: Date,
}, { timestamps: true });

export default model<IChatDocument>("Chat", chatSchema);