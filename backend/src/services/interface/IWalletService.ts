import { EscrowDetailsDTO, FinancialReportDTO, WalletDetailsDTO, WalletDTO, WalletInvoicesDTO, WalletTransactionsDTO } from "../../dtos/wallet.dto";
import { WalletTransactionDTO } from "../../dtos/walletTransaction.dto";
import { Types } from "mongoose";
import { PaginatedResult } from "../../types/pagination";

export interface IWalletService {
    getWalletDetails(userId: string, page: number, limit: number): Promise<WalletDetailsDTO>;
    getEscrowDetails(userId: string, page: number, limit: number): Promise<EscrowDetailsDTO>;
    getTransactions(userId: string, page: number, limit: number): Promise<WalletTransactionsDTO>;
    getInvoices(userId: string, page: number, limit: number): Promise<WalletInvoicesDTO>;
    downloadInvoicePdf(userId: string, transactionId: string): Promise<Buffer>;
    getFinancialReport(userId: string, from: Date, to: Date): Promise<FinancialReportDTO>;
    getEscrowStatsForAssignments(assignmentIds: Types.ObjectId[]): Promise<{ funded: number; released: number; }>;
    getAllUserWallets(search: string, page: number, limit: number): Promise<PaginatedResult<WalletDTO>>;
    getUserWalletTransactions(walletId: string, search: string, page: number, limit: number)
    : Promise<PaginatedResult<WalletTransactionDTO>>;
}