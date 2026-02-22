"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class PaymentController {
    constructor(_paymentService) {
        this._paymentService = _paymentService;
    }
    async createOrder(req, res, next) {
        try {
            const { assignmentId, milestoneId } = req.params;
            const clientId = req.user?._id;
            if (!clientId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const result = await this._paymentService.createMilestoneOrder(assignmentId, milestoneId, clientId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, result);
        }
        catch (error) {
            next(error);
        }
    }
    async refund(req, res, next) {
        try {
            const { paymentId } = req.params;
            const initiatorId = req.user?._id;
            const { reason } = req.body;
            if (!initiatorId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const result = await this._paymentService.refundMilestone(paymentId, initiatorId, reason);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, result);
        }
        catch (error) {
            next(error);
        }
    }
    async release(req, res, next) {
        try {
            const { paymentId } = req.params;
            const clientId = req.user?._id;
            if (!clientId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const result = await this._paymentService.releaseMilestone(paymentId, clientId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllDisputes(req, res, next) {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const disputes = await this._paymentService.listDisputes(search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { disputes });
        }
        catch (error) {
            next(error);
        }
    }
    async getDisputeById(req, res, next) {
        try {
            const { paymentId } = req.params;
            const dispute = await this._paymentService.getDisputeById(paymentId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { dispute });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllPayments(req, res, next) {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const payments = await this._paymentService.getAllPayments(search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { payments });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllWithdrawals(req, res, next) {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const withdrawals = await this._paymentService.getAllWithdrawals(search, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { withdrawals });
        }
        catch (error) {
            next(error);
        }
    }
    async getWithdrawals(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            }
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const data = await this._paymentService.getWithdrawals(userId, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, data);
        }
        catch (error) {
            next(error);
        }
    }
    async withdraw(req, res, next) {
        try {
            const userId = req.user?._id;
            const role = req.user?.role;
            const { amount } = req.body;
            if (!userId || !role)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            await this._paymentService.withdraw(userId, role, amount);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {});
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
