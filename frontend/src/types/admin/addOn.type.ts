// Full AddOn interface (matches schema)
export interface AddOn {
  id: string;
  key: string;
  displayName: string;   
  description?: string;
  category: "bid" | "job" | "profile";
  price: number;
  userType: "freelancer" | "client" | "both"; 
  flags: {
    highlight: boolean;
    sealed: boolean;
    sponsored: boolean;
  };
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddOnForm {
  key: string;
  displayName: string;
  description?: string;
  category: "bid" | "job" | "profile";
  price: number;
  userType: "freelancer" | "client" | "both";
  flags: {
    highlight: boolean;
    sealed: boolean;
    sponsored: boolean;
  };
  sortOrder: number;
  status?: "active" | "inactive";
}