import { model, Schema } from "mongoose";
import { IAddOnDocument } from "types/addOns.type";

const AddOnsSchema = new Schema({
  key: { type: String, required: true, unique: true }, 
  displayName: { type: String, required: true },
  description: { type: String },

  category: { type: String, enum: ['bid', 'job', 'profile'], required: true },

  price: { type: Number, required: true },

  userType: { type: String, enum: ['freelancer', 'client', 'both'], default: 'freelancer' },

  flags: {
    highlight: { type: Boolean, default: false },
    sealed: { type: Boolean, default: false },
    sponsored: { type: Boolean, default: false }
  },

  sortOrder: { type: Number, default: 100 },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });


export default model<IAddOnDocument>("AddOn", AddOnsSchema);