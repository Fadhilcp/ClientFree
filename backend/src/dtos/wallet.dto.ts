export interface WalletDTO {
  id: string;

  currency: string;
  status: "active" | "suspended";
  role: "client" | "freelancer" | "admin";

  balance: {
    available: number;
    escrow: number;
    pending: number;
  };

  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  createdAt?: Date;
  updatedAt?: Date;
}
