import { model, Schema } from "mongoose";
import { IProposalInvitationDocument } from "types/proposalInvitation.type";

const proposalInvitationSchema = new Schema({
  freelancerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  jobId: {
    type: Schema.Types.ObjectId,
    ref: "Jobs",
    required: true
  },

  isInvitation: { type: Boolean, default: false },

  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  invitation: {
    title: String,
    message: String,
    respondedAt: Date
  },

  bidAmount: Number,
  duration: String,
  description: String,

  milestones: [
    {
      title: { type: String, required: true },
      amount: { type: Number, required: true },
      dueDate: Date,
      description: String
    }
  ],

  optionalUpgrades: [
    {
      addonId: Schema.Types.ObjectId,
      name: { type: String, enum: ["highlight", "sponsored", "sealed"] },
      price: Number
    }
  ],

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "invited", "shortlisted"],
    default: "pending"
  }
},{ timestamps: true });

export default model<IProposalInvitationDocument>("ProposalInvitation", proposalInvitationSchema);