import { Schema, model } from "mongoose";
import { IJobDocument } from "../types/job.type";

const JobSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: { type: String, required: true },
  category: String,
  subcategory: String,
  skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],

  duration: String,

  hoursPerDay: {
    type: Number,
    min: 1,
    max: 24
  },

  payment: {
    budget: Number,
    type: { type: String, enum: ["fixed", "hourly"] }
  },

  description: String,

  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public"
  },

  locationPreference: {
    city: String,
    country: String,
    type: { type: String, enum: ["specific", "worldwide"] }
  },

  status: {
    type: String,
    enum: ["open", "active", "completed", "cancelled"],
    default: "open"
  },

  proposalCount: { type: Number, default: 0 },

  proposals: [
    { type: Schema.Types.ObjectId, ref: "ProposalInvitation" }
  ],

  isFeatured: { type: Boolean, default: false },
  isMultiFreelancer: { type: Boolean, default: false },

  acceptedProposalIds: [{ type: Schema.Types.ObjectId, ref: "ProposalInvitation" }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
},{ timestamps: true });

export default model<IJobDocument>("Job", JobSchema);