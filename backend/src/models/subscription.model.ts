import { model, Schema } from "mongoose";
import { ISubscriptionDocument } from "../types/subscription.type";

const subscriptionSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    }, 
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    startDate: { type: Date },
    expiryDate: { type: Date },

    autoRenew: { type: Boolean, default: false },
    billingInterval: { type: String, enum: ["monthly", "yearly"], required: true },

    status: {
      type: String,
      enum: ["pending","active", "expired", "cancelled"],
      default: "pending",
    },

    gateway: {
      type: String,
      enum: ["razorpay", "stripe", "manual"],
      default: "razorpay",
    },
    customerId: { type: String },
    subscriptionId: { type: String },

    checkoutSessionId: { type: String, index: true },
    
},{ timestamps: true });

export default model<ISubscriptionDocument>('Subscription', subscriptionSchema);