import { IWalletRepository } from "../repositories/interfaces/IWalletRepository";
import { IWalletService } from "./interface/IWalletService";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { FilterQuery, Types } from "mongoose";
import { IWalletTransactionDocument } from "../types/walletTransaction.type";
import { IWalletTransactionRepository } from "../repositories/interfaces/IWalletTransactionRepository";
import { mapWalletTransaction } from "../mappers/walletTransaction.mapper";
import { generateInvoicePdf } from "../utils/generateInvoicePdf";
import { EMPTY_SUMMARY } from "../constants/report-summary-empty";
import { PaginatedResult } from "../types/pagination";
import { WalletTransactionDTO } from "../dtos/walletTransaction.dto";
import { mapWallet } from "../mappers/wallet.mapper";
import { WalletDTO } from "../dtos/wallet.dto";

export class WalletService implements IWalletService {
    constructor(
        private _walletRepository: IWalletRepository,
        private _walletTransactionRepository: IWalletTransactionRepository,
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

    async getAllUserWallets(search: string, page: number, limit: number)
    : Promise<PaginatedResult<WalletDTO>> {
        
        const { wallets, total, totalPages } = 
            await this._walletRepository.getAllWalletsAggregate(search, page, limit);

        return {
            data: wallets.map(mapWallet),
            total,
            page,
            limit,
            totalPages,
        };
    }

    async getUserWalletTransactions(walletId: string, search: string, page: number, limit: number)
    : Promise<PaginatedResult<WalletTransactionDTO> & { wallet: WalletDTO }> {

        const wallet = await this._walletRepository.findOneWithUser({ _id: walletId });
        if(!wallet) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.WALLET_NOT_FOUND);

        const query: FilterQuery<IWalletTransactionDocument> = {
            walletId: new Types.ObjectId(walletId),
        };

        if (search) {
            const isObjectId = Types.ObjectId.isValid(search);

            query.$or = [
            { type: search },
            ...(isObjectId
                ? [
                    { paymentId: new Types.ObjectId(search) },
                    { milestoneId: new Types.ObjectId(search) },
                    { jobAssignmentId: new Types.ObjectId(search) },
                ]
                : []),
            ];
        }

        const { data, total, totalPages } = await this._walletTransactionRepository.paginate(query, { page, limit });

        return {
            wallet: mapWallet(wallet),
            data: data.map(mapWalletTransaction),
            total,
            page,
            limit,
            totalPages
        };
    }

}