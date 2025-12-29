import { IWalletRepository } from "repositories/interfaces/IWalletRepository";
import { IWalletService } from "./interface/IWalletService";
import { IWalletDocument } from "types/wallet.type";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import { ClientSession, FilterQuery, Types } from "mongoose";
import { IWalletTransactionDocument } from "types/walletTransaction.type";
import { IWalletTransactionRepository } from "repositories/interfaces/IWalletTransactionRepository";
import { mapWalletTransaction } from "mappers/walletTransaction.mapper";
import { generateInvoicePdf } from "utils/generateInvoicePdf";
import { EMPTY_SUMMARY } from "constants/report-summary-empty";
import { IDatabaseSessionProvider } from "repositories/db/session-provider.interface";

export class WalletService implements IWalletService {
    constructor(
        private _walletRepository: IWalletRepository,
        private _walletTransactionRepository: IWalletTransactionRepository,
        private _sessionProvider: IDatabaseSessionProvider
    ){};

    async getWalletDetails(userId: string, page: number, limit: number): Promise<any> {
        const wallet = await this._walletRepository.findOne({ userId: userId });

        if(!wallet) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.WALLET_NOT_FOUND);

        const filter: FilterQuery<IWalletTransactionDocument> = { walletId: wallet._id };

        const result = await this._walletTransactionRepository.paginate(filter, { 
            page, limit, sort: { createdAt: -1 } 
        });

        return {
            balance: {
                available: wallet.balance.available,
                escrow: wallet.balance.escrow,
                pending: wallet.balance.pending,
                currency: wallet.currency,
            },
            transactions: result.data.map(mapWalletTransaction),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }

    async getEscrowDetails(userId: string, page: number, limit: number): Promise<any> {
        const wallet = await this._walletRepository.findOne({ userId });
        if(!wallet) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.WALLET_NOT_FOUND);
        }

        const filter: FilterQuery<IWalletTransactionDocument> = {
            walletId: wallet._id,
            type: "escrow_hold",
            status: "completed"
        };

        const result = await this._walletTransactionRepository.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 }
        });

          return {
            escrowBalance: wallet.balance.escrow,
            currency: wallet.currency,
            transactions: result.data.map(mapWalletTransaction),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }

    async getTransactions(userId: string, page: number, limit: number): Promise<any> {
        const wallet = await this._walletRepository.findOne({ userId });

        if(!wallet) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.WALLET_NOT_FOUND);

        const filter: FilterQuery<IWalletTransactionDocument> = { walletId: wallet._id };

        const result = await this._walletTransactionRepository.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 }
        });

        return {
            transactions: result.data.map(mapWalletTransaction),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }

    async getInvoices(userId: string, page: number, limit: number): Promise<any> {
        const wallet = await this._walletRepository.findOne({ userId });
        if(!wallet) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.WALLET_NOT_FOUND);

        const filter: FilterQuery<IWalletTransactionDocument> = {
            walletId: wallet._id,
            type: { $in: ["escrow_hold", "escrow_release", "withdrawal", "refund"] },
            status: "completed"
        };

        const result = await this._walletTransactionRepository.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 }
        });

        return {
            invoices: result.data.map(mapWalletTransaction),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        }
    }

    async downloadInvoicePdf(userId: string, transactionId: string) {
        const transaction = await this._walletTransactionRepository.findOne({
            _id: transactionId,
            userId,
            type: { $in: ["escrow_hold", "escrow_release", "withdrawal", "refund"] }
        });

        if (!transaction) {
            throw createHttpError(HttpStatus.NOT_FOUND, "Invoice not found");
        }

        // build invoice data
        const invoiceData = {
            invoiceNumber: `INV-${transaction._id.toString().slice(-6).toUpperCase()}`,
            type: transaction.type,
            amount: transaction.amount,
            currency: transaction.currency,
            date: transaction.createdAt,
            direction: transaction.direction
        };

        // generate PDF 
        return generateInvoicePdf(invoiceData);
    }

    async getFinancialReport(userId: string, from: Date, to: Date): Promise<any> {
        const wallet = await this._walletRepository.findOne({ userId });

        if (!wallet) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.WALLET_NOT_FOUND);
        }

        const result = await this._walletTransactionRepository.aggregateFinancialReport(wallet._id.toString(), from, to);

        const summary =
            result.length > 0
                ? {
                    ...EMPTY_SUMMARY,
                    ...result[0],
                    freelancer: {
                    ...EMPTY_SUMMARY.freelancer,
                    ...result[0]?.freelancer
                    },
                    client: {
                    ...EMPTY_SUMMARY.client,
                    ...result[0]?.client
                    }
                }
                : EMPTY_SUMMARY;
        
        return {
            from,
            to,
            summary,
        };
    }

    async getWithdrawals(userId: string, page: number, limit: number): Promise<any> {
        const wallet = await this._walletRepository.findOne({ userId });

        if(!wallet) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.WALLET_NOT_FOUND);

        const filter: FilterQuery<IWalletTransactionDocument> = {
            walletId: wallet._id,
            type: "withdrawal",
            direction: "debit",
        };

        const result = await this._walletTransactionRepository.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 },
        });

        return {
            balances: {
                available: wallet.balance.available,
                escrow: wallet.balance.escrow,
                pending: wallet.balance.pending,
                currency: wallet.currency
            },

            withdrawableAmount: wallet.balance.available,

            withdrawals: result.data.map(mapWalletTransaction),

            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            }
        };
    }

    async getEscrowStatsForAssignments(
        assignmentIds: Types.ObjectId[]
    ): Promise<{ funded: number; released: number; }> {

        if (!assignmentIds.length) {
            return { funded: 0, released: 0 };
        }

        const rows = await this._walletTransactionRepository.aggregateEscrowByAssignments(assignmentIds);

        let funded = 0;
        let released = 0;

        for (const row of rows) {
            if (row._id === "escrow_hold") {
                funded = row.total;
            }
            if (row._id === "escrow_release") {
                released = row.total;
            }
        }

        return { funded, released };
    }

    async withdraw(userId: string, amount: number): Promise<void> {

        if (!amount || amount <= 0) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid withdrawal amount");
        }

        return this._sessionProvider.runInTransaction(
            async (session: ClientSession) => {

                const wallet = await this._walletRepository.findOneWithSession(
                    { userId, role: "freelancer", status: "active" },
                    session
                );

                if (!wallet) {
                    throw createHttpError(HttpStatus.BAD_REQUEST, "Wallet not found");
                }

                if (wallet.balance.available < amount) {
                    throw createHttpError(HttpStatus.BAD_REQUEST, "Insufficient balance");
                }

                wallet.balance.available -= amount;
                wallet.updatedAt = new Date();
                await wallet.save({ session });

                await this._walletTransactionRepository.createWithSession(
                    {
                        walletId: wallet._id,
                        userId: wallet.userId,
                        type: "withdrawal",
                        direction: "debit",
                        amount,
                        status: "completed",
                        balanceAfter: {
                        available: wallet.balance.available,
                        escrow: wallet.balance.escrow,
                        pending: wallet.balance.pending
                        }
                    },
                    session
                );
            }
        );
    }

}