import { model, Schema } from "mongoose";
import { IWalletDocument } from "types/wallet.type";

const walletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },

  role: {
    type: String,
    enum: ["client", "freelancer", "admin"],
    required: true
  },

  balance: {
    available: { type: Number, default: 0 }, 
    escrow: { type: Number, default: 0 },
    pending: { type: Number, default: 0 } 
  },

  currency: {
    type: String,
    default: "INR"
  },

  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active"
  }
}, { timestamps: true });

walletSchema.index({ userId: 1 });

export default model<IWalletDocument>('Wallet', walletSchema);