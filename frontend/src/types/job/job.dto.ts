export interface JobBaseDTO {
  id: string;
  clientId: string;

  title: string;
  category?: string;
  subcategory?: string;

  skills?: string[];

  duration?: string;

  payment?: {
    budget?: number;
    type?: "fixed" | "hourly";
  };

  description?: string;

  visibility: "public" | "private";
  status: "open" | "active" | "completed" | "cancelled";

  proposalCount: number;
  isFeatured: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface JobListDTO extends JobBaseDTO {}

export interface JobDetailDTO extends JobBaseDTO {
  locationPreference?: {
    city?: string;
    country?: string;
    type?: "specific" | "worldwide";
  };

  proposals: string[];
  isMultiFreelancer: boolean;
  acceptedProposalIds: string[];
}


export interface JobForm {
  title: string;
  category: string;
  subcategory: string;
  skills: string[];
  duration: string;
  paymentBudget: string;
  paymentType: "fixed" | "hourly";
  description: string;
  visibility: "public" | "private";
  locationCity: string;
  locationCountry: string;
  locationType: "specific" | "worldwide";
  isFeatured: boolean;
  [key: string]: any;
}