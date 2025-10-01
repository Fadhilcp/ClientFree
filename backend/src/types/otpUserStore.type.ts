import { ObjectId, Document } from "mongoose";

export interface IOtpUserStore {
  username?: string;
  email: string;
  password?: string;
  role?: 'freelancer' | 'client'; 
  otp: string;
  purpose: 'signup' | 'forgot-password' | 'email-change' | 'phone-change';
  isVerified?: boolean;
  verifiedAt?: Date;
  newEmail?: string;
  newPhone?: string;
  expiresAt: Date;
}

export interface IOtpUserStoreDocument extends IOtpUserStore, Document {
  _id: ObjectId;
}