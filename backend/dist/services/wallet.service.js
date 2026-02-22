"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const mongoose_1 = require("mongoose");
const walletTransaction_mapper_1 = require("../mappers/walletTransaction.mapper");
const generateInvoicePdf_1 = require("../utils/generateInvoicePdf");
const report_summary_empty_1 = require("../constants/report-summary-empty");
const wallet_mapper_1 = require("../mappers/wallet.mapper");
class WalletService {
    constructor(_walletRepository, _walletTransactionRepository) {
        this._walletRepository = _walletRepository;
        this._walletTransactionRepository = _walletTransactionRepository;
    }
    ;
    async getWalletDetails(userId, page, limit) {
        const wallet = await this._walletRepository.findOne({ userId: userId });
        if (!wallet)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.WALLET_NOT_FOUND);
        const filter = { walletId: wallet._id };
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
            transactions: result.data.map(walletTransaction_mapper_1.mapWalletTransaction),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }
    async getEscrowDetails(userId, page, limit) {
        const wallet = await this._walletRepository.findOne({ userId });
        if (!wallet) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.WALLET_NOT_FOUND);
        }
        const filter = {
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
            transactions: result.data.map(walletTransaction_mapper_1.mapWalletTransaction),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }
    async getTransactions(userId, page, limit) {
        const wallet = await this._walletRepository.findOne({ userId });
        if (!wallet)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.WALLET_NOT_FOUND);
        const filter = { walletId: wallet._id };
        const result = await this._walletTransactionRepository.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 }
        });
        return {
            transactions: result.data.map(walletTransaction_mapper_1.mapWalletTransaction),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }
    async getInvoices(userId, page, limit) {
        const wallet = await this._walletRepository.findOne({ userId });
        if (!wallet)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.WALLET_NOT_FOUND);
        const filter = {
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
            invoices: result.data.map(walletTransaction_mapper_1.mapWalletTransaction),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }
    async downloadInvoicePdf(userId, transactionId) {
        const transaction = await this._walletTransactionRepository.findOne({
            _id: transactionId,
            userId,
            type: { $in: ["escrow_hold", "escrow_release", "withdrawal", "refund"] }
        });
        if (!transaction) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Invoice not found");
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
        return (0, generateInvoicePdf_1.generateInvoicePdf)(invoiceData);
    }
    async getFinancialReport(userId, from, to) {
        const wallet = await this._walletRepository.findOne({ userId });
        if (!wallet) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.WALLET_NOT_FOUND);
        }
        const result = await this._walletTransactionRepository.aggregateFinancialReport(wallet._id.toString(), from, to);
        const summary = result.length > 0
            ? {
                ...report_summary_empty_1.EMPTY_SUMMARY,
                ...result[0],
                freelancer: {
                    ...report_summary_empty_1.EMPTY_SUMMARY.freelancer,
                    ...result[0]?.freelancer
                },
                client: {
                    ...report_summary_empty_1.EMPTY_SUMMARY.client,
                    ...result[0]?.client
                }
            }
            : report_summary_empty_1.EMPTY_SUMMARY;
        return {
            from,
            to,
            summary,
        };
    }
    async getEscrowStatsForAssignments(assignmentIds) {
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
    async getAllUserWallets(search, page, limit) {
        const { wallets, total, totalPages } = await this._walletRepository.getAllWalletsAggregate(search, page, limit);
        return {
            data: wallets.map(wallet_mapper_1.mapWallet),
            total,
            page,
            limit,
            totalPages,
        };
    }
    async getUserWalletTransactions(walletId, search, page, limit) {
        const wallet = await this._walletRepository.findOneWithUser({ _id: walletId });
        if (!wallet)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.WALLET_NOT_FOUND);
        const query = {
            walletId: new mongoose_1.Types.ObjectId(walletId),
        };
        if (search) {
            const isObjectId = mongoose_1.Types.ObjectId.isValid(search);
            query.$or = [
                { type: search },
                ...(isObjectId
                    ? [
                        { paymentId: new mongoose_1.Types.ObjectId(search) },
                        { milestoneId: new mongoose_1.Types.ObjectId(search) },
                        { jobAssignmentId: new mongoose_1.Types.ObjectId(search) },
                    ]
                    : []),
            ];
        }
        const { data, total, totalPages } = await this._walletTransactionRepository.paginate(query, { page, limit });
        return {
            wallet: (0, wallet_mapper_1.mapWallet)(wallet),
            data: data.map(walletTransaction_mapper_1.mapWalletTransaction),
            total,
            page,
            limit,
            totalPages
        };
    }
}
exports.WalletService = WalletService;
