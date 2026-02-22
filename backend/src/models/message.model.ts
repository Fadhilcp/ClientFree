import { model, Schema } from "mongoose";
import { IMessageDocument } from "../types/message.type";

const messageSchema = new Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },

  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  type: {
    type: String,
    enum: ['text', 'file', 'voice', 'video_call', 'voice_call'],
    required: true
  },

  content: { type: String },

  file: {
    name: { type: String },
    key: { type: String },
    size: { type: Number },
    type: { type: String },
    url: { type: String }
  },

  voice: {
    url: { type: String },
    duration: { type: Number }
  },

  callDetails: {
    callType: { type: String, enum: ['voice', 'video'] },
    callStart: Date,
    callEnd: Date,
    callStatus: { type: String, enum: ['missed', 'completed', 'declined'] }
  },

  isReadBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

}, { timestamps: true });

export default model<IMessageDocument>("Message", messageSchema);