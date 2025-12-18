import { model, Schema } from "mongoose";
import { IPaymentDocument } from "types/payment.type";

const paymentSchema = new Schema({
  type: {
    type: String,
    enum: [
      'escrow',
      'milestone',
      'fullPayment',
      'refund',
      'withdrawal',
      'subscription',
      'addon',
    ],
    required: true
  },

  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'completed',
      'refund_processing',
      'refunded',
      'cancelled',
      'failed'
    ],
    default: 'pending'
  },

  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },

  method: { type: String }, // razorpay, wallet, stripe, paypal, bank
  provider: { type: String, default: "razorpay" },

  // Razorpay fields
  providerPaymentId: { type: String }, 
  providerOrderId: { type: String }, 
  providerSignature: { type: String },

  jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
  milestoneId: { type: Schema.Types.ObjectId, ref: 'Milestones' },
  proposalId: { type: Schema.Types.ObjectId, ref: "Proposal" },

  freelancerId: { type: Schema.Types.ObjectId, ref: 'User' },
  clientId: { type: Schema.Types.ObjectId, ref: 'User' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' }, // initiator

  isDisputed: { type: Boolean, default: false },
  disputeReason: { type: String },
  
  adminNotes: { type: String },

  // financial tracking
  platformFee: { type: Number, default: 0 },
  paymentGatewayFee: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },

  refundReason: { type: String },

  paymentDate: { type: Date },
  escrowReleaseDate: { type: Date },
  refundDate: { type: Date },
  withdrawalDate: { type: Date },

  referenceId: { type: String },

  // soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

export default model<IPaymentDocument>('Payment', paymentSchema);