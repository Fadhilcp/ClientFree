"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class WalletController {
    constructor(_walletService) {
        this._walletService = _walletService;
    }
    ;
    async getWallet(req, res, next) {
        try {
            const userId = req.user?._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const data = await this._walletService.getWalletDetails(userId, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, data);
        }
        catch (error) {
            next(error);
        }
    }
    async getEscrowDetails(req, res, next) {
        try {
            const userId = req.user?._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const data = await this._walletService.getEscrowDetails(userId, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, data);
        }
        catch (error) {
            next(error);
        }
    }
    async getTransactions(req, res, next) {
        try {
            const userId = req.user?._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const data = await this._walletService.getTransactions(userId, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, data);
        }
        catch (error) {
            next(error);
        }
    }
    async getInvoices(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const data = await this._walletService.getInvoices(userId, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, data);
        }
        catch (error) {
            next(error);
        }
    }
    async downloadInvoice(req, res, next) {
        try {
            const userId = req.user?._id;
            const { transactionId } = req.params;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const pdfBuffer = await this._walletService.downloadInvoicePdf(userId, transactionId);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=invoice-${transactionId}.pdf`);
            res.setHeader("Content-Length", pdfBuffer.length);
            res.status(status_constants_1.HttpStatus.OK).send(pdfBuffer);
        }
        catch (error) {
            next(error);
        }
    }
    async getFinancialReport(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const fromRaw = req.query.from;
            const toRaw = req.query.to;
            if (!fromRaw || !toRaw) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "from and to dates are required");
            }
            const from = new Date(fromRaw);
            const to = new Date(toRaw);
            if (isNaN(from.getTime()) || isNaN(to.getTime())) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Invalid date format");
            }
            const report = await this._walletService.getFinancialReport(userId, new Date(from), new Date(to));
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { report });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUserWallets(req, res, next) {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const wallets = await this._walletService.getAllUserWallets(search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { wallets });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUserWalletTransactions(req, res, next) {
        try {
            const { walletId } = req.params;
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const transactions = await this._walletService.getUserWalletTransactions(walletId, search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { transactions });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WalletController = WalletController;
