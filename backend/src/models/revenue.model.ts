import { model, Schema } from "mongoose";
import { IRevenueDocument } from "../types/revenue.type";

const revenueSchema = new Schema({
  type: { 
    type: String, 
    enum: ['commission', 'subscription', 'addOn'],
    required: true
  },

  source: { 
    type: String, 
    enum: ['freelancer', 'client'], 
    required: true
  },

  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },

  referencePaymentId: { type: Schema.Types.ObjectId, ref: "Payments" },
  referenceId: { type: Schema.Types.ObjectId }, // planId, jobId, milestoneId, addOnId
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoices' },

  method: { type: String }, // card, wallet, razorpay, stripe, paypal etc
  provider: { type: String }, // razorpay, stripe, paypal etc
  providerPaymentId: { type: String },

  gatewayFee: { type: Number, default: 0 },

  status: { 
    type: String, 
    enum: ['pending', 'completed', 'refunded', 'failed'], 
    default: 'completed'
  }
},{ timestamps: true });

export default model<IRevenueDocument>('Revenue', revenueSchema);