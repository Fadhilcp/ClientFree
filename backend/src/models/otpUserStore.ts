import { Schema, model } from 'mongoose';
import { IOtpUserStoreDocument } from '../types/otpUserStore.type.js';

const otpUserStoreSchema = new Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'forgot-password', 'email-change', 'phone-change'],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type : Date,
      default : null
    },
    newEmail: {
      type: String
    },
    newPhone: {
      type: String
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IOtpUserStoreDocument>('OtpUserStore', otpUserStoreSchema);