import { model, Schema } from "mongoose";
import { IClarificationBoardDocument } from "types/clarificationBoard";

const clarificationBoardSchema = new Schema({
  jobId: { 
    type: Schema.Types.ObjectId, 
    ref: "Jobs", 
    required: true 
  },

  status: { 
    type: String, 
    enum: ["open", "closed"], 
    default: "open" 
  },

  messageCount: { 
    type: Number, 
    default: 0 
  },

  lastMessageAt: { 
    type: Date 
  },

  isDeleted: { 
    type: Boolean, 
    default: false 
  },

  deletedAt: { 
    type: Date 
  }
}, { timestamps: true });

export default model<IClarificationBoardDocument>(
  'ClarificationBoard', 
  clarificationBoardSchema
);