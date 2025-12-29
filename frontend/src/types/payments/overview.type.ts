export type ClientOverview = {
  walletBalance: number;
  pendingPayments: number;
  releasedPayments: number;
  upcomingMilestones: number;
  paymentGraph: {
    month: number;
    year: number;
    type: "escrow_hold" | "escrow_release";
    total: number;
  }[];
  recentTransactions: any[];
};

export type FreelancerOverview = {
  walletBalance: number;
  pendingClearance: number;
  totalEarned: number;
  totalWithdrawn: number;
  paymentGraph: {
    month: number;
    year: number;
    total: number;
  }[];
  recentTransactions: any[];
};

export type Overview = ClientOverview | FreelancerOverview;