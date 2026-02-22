import { UserRole } from "../constants/user.constants";

export type AuthPayload = {
  _id: string;
  email: string;
  role: UserRole;
};

export type OtpPurpose = 'signup' | 'forgot-password' | 'email-change' | 'phone-change';