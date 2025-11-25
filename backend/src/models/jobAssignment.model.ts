import { model, Schema } from "mongoose";
import { IJobAssignmentDocument } from "types/jobAssignment.type";

const jobAssignmentSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: "Jobs", required: true },
  freelancerId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
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

    paymentId: { type: Schema.Types.ObjectId, ref: "Payments" },

    status: {
      type: String,
      enum: ["created", "funded", "released", "refunded", "disputed", "cancelled"],
      default: "created"
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],

  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active"
  }

}, { timestamps: true });

export default model<IJobAssignmentDocument>('JobAssignment',jobAssignmentSchema);