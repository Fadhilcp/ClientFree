export interface IProposal {
  jobId: string;
  bidAmount: number;
  duration: string;
  description: string;
  milestones?: Milestone[];
  optionalUpgrades?: Array<{
    addonId: string;
    name: "highlight" | "sponsored" | "sealed";
    price: number;
  }>;
}

export interface Milestone {
  title: string;
  amount: number;
  dueDate?: string;
  description?: string;
}