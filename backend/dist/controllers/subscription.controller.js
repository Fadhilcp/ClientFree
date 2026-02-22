"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class SubscriptionController {
    constructor(_subscriptionService) {
        this._subscriptionService = _subscriptionService;
    }
    async getAllSubscription(req, res, next) {
        try {
            const search = req.query.search || '';
            const status = req.query.status || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const subscriptions = await this._subscriptionService.getAll(search, status, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { subscriptions });
        }
        catch (error) {
            next(error);
        }
    }
    async createSubscription(req, res, next) {
        try {
            const { userId, email, contact, planId, billingInterval } = req.body;
            if (!userId || !planId || !billingInterval) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.MISSING_REQUIRED_FIELDS);
            }
            const { checkoutUrl } = await this._subscriptionService.createSubscription({
                userId,
                planId,
                billingInterval,
                gateway: 'razorpay',
                status: 'active',
                autoRenew: true,
                email,
                contact,
            });
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.CREATED, { checkoutUrl });
        }
        catch (error) {
            next(error);
        }
    }
    async upgradeSubscription(req, res, next) {
        try {
            const userId = req.user?._id;
            const { planId, billingInterval } = req.body;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            if (!planId || !billingInterval) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "planId and billingInterval are required");
            }
            if (!["monthly", "yearly"].includes(billingInterval)) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Invalid billing interval");
            }
            const { paymentUrl } = await this._subscriptionService.upgradeSubscription(userId, planId, billingInterval);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { paymentUrl }, "Subscription upgraded successfully");
        }
        catch (error) {
            next(error);
        }
    }
    async cancelSubscription(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
            const result = await this._subscriptionService.cancelSubscription(userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async getCurrentPlan(req, res, next) {
        try {
            const _id = req.user?._id;
            if (!_id) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'User ID is required');
            }
            const plan = await this._subscriptionService.getCurrentPlan(_id);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { plan });
        }
        catch (error) {
            next(error);
        }
    }
    async getActiveFeatures(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const subscription = await this._subscriptionService.getActiveFeatures(userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { subscription });
        }
        catch (error) {
            next(error);
        }
    }
    async getMySubscriptions(req, res, next) {
        try {
            const userId = req.user?._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const subscriptions = await this._subscriptionService.getMySubscriptions(userId, page, limit);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { subscriptions });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SubscriptionController = SubscriptionController;
