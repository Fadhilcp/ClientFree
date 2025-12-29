import { Types } from "mongoose";

export interface IWalletService {
    getWalletDetails(userId: string, page: number, limit: number): Promise<any>;
    getEscrowDetails(userId: string, page: number, limit: number): Promise<any>;
    getTransactions(userId: string, page: number, limit: number): Promise<any>;
    getInvoices(userId: string, page: number, limit: number): Promise<any>;
    downloadInvoicePdf(userId: string, transactionId: string): Promise<any>;
    getFinancialReport(userId: string, from: Date, to: Date): Promise<any>;
    getWithdrawals(userId: string, page: number, limit: number): Promise<any>;
    getEscrowStatsForAssignments(assignmentIds: Types.ObjectId[]): Promise<{ funded: number; released: number; }>;
    withdraw(userId: string, amount: number): Promise<void>;
}