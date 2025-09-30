export type AuthPayload = {
  _id: string;
  email: string;
  role: "freelancer" | "client" | "admin";
};
