import { model, Schema } from "mongoose";
import { IClarificationMessageDocument } from "types/clarificationMessage";

const clarificationMessageSchema = new Schema({
  boardId: { 
    type: Schema.Types.ObjectId, 
    ref: "ClarificationBoard", 
    required: true 
  },

  senderId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  senderRole: { 
    type: String, 
    enum: ["freelancer", "client"], 
    required: true 
  },

  message: { 
    type: String, 
    required: true 
  },

  isDeleted: { 
    type: Boolean, 
    default: false 
  },

  deletedAt: { 
    type: Date 
  },

  sentAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });


export default model<IClarificationMessageDocument>(
    'ClarificationMessage', 
    clarificationMessageSchema
);