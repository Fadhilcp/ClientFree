import { WalletDTO } from "dtos/wallet.dto";
import { WalletTransactionDTO } from "dtos/walletTransaction.dto";
import { Types } from "mongoose";
import { PaginatedResult } from "types/pagination";
import { IWalletDocument } from "types/wallet.type";
import { IWalletTransactionDocument } from "types/walletTransaction.type";

export interface IWalletService {
    getWalletDetails(userId: string, page: number, limit: number): Promise<any>;
    getEscrowDetails(userId: string, page: number, limit: number): Promise<any>;
    getTransactions(userId: string, page: number, limit: number): Promise<any>;
    getInvoices(userId: string, page: number, limit: number): Promise<any>;
    downloadInvoicePdf(userId: string, transactionId: string): Promise<any>;
    getFinancialReport(userId: string, from: Date, to: Date): Promise<any>;
    getEscrowStatsForAssignments(assignmentIds: Types.ObjectId[]): Promise<{ funded: number; released: number; }>;
    getAllUserWallets(search: string, page: number, limit: number): Promise<PaginatedResult<WalletDTO>>;
    getUserWalletTransactions(walletId: string, search: string, page: number, limit: number)
    : Promise<PaginatedResult<WalletTransactionDTO>>;
}