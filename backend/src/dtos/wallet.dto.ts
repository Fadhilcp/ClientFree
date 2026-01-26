import { EMPTY_SUMMARY } from "constants/report-summary-empty";
import { WalletTransactionDTO } from "./walletTransaction.dto";

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

export interface WalletBalanceDTO {
  available: number;
  escrow: number;
  pending: number;
  currency: string;
}

// Wallet details
export interface WalletDetailsDTO {
  balance: WalletBalanceDTO;
  transactions: WalletTransactionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Escrow details
export interface EscrowDetailsDTO {
  escrowBalance: number;
  currency: string;
  transactions: WalletTransactionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Transactions
export interface WalletTransactionsDTO {
  transactions: WalletTransactionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Invoices
export interface WalletInvoicesDTO {
  invoices: WalletTransactionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Invoice PDF
export interface InvoicePdfDTO {
  buffer: Buffer;
  filename: string;
  mimeType: "application/pdf";
}

// Financial report
export interface FinancialReportDTO {
  from: Date;
  to: Date;
  summary: typeof EMPTY_SUMMARY;
}