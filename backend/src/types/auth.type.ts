export type AuthPayload = {
  _id: string;
  email: string;
  role: "freelancer" | "client" | "admin";
};

export type OtpPurpose = 'signup' | 'forgot-password' | 'email-change' | 'phone-change';