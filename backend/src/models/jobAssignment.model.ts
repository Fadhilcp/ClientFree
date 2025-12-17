import { model, Schema } from "mongoose";
import { IJobAssignmentDocument } from "types/jobAssignment.type";

const jobAssignmentSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  proposalId: { type: Schema.Types.ObjectId, ref: "ProposalInvitation", required: true },

  amount: { type: Number, required: true },

  tasks: [{
    id: String,
    title: String,
    status: { type: String, enum: ["pending","inProgress","completed","cancelled"], default: "pending" },
    dueDate: Date
  }],

  milestones: [{
    title: { type: String, required: true },
    description: String,
    amount: { type: Number, required: true },
    dueDate: Date,

    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },

    status: {
      type: String,
      enum: ["draft", "funded", "submitted", "changes_requested", "approved", "released", "refunded", "disputed", "cancelled"],
      default: "draft"
    },
    submissionMessage: { type: String },
    submissionFiles: [{
      url: { type: String },
      name: { type: String },
      type: { type: String },
      key: { type: String },
    }],
    submittedAt: Date,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],

  status: {
    type: String,
    enum: ["pending", "active", "onHold", "completed", "cancelled"],
    default: "pending"
  }

}, { timestamps: true });

export default model<IJobAssignmentDocument>('JobAssignment',jobAssignmentSchema);