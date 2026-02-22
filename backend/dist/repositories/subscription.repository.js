"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRepository = void 0;
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
const base_repository_1 = require("./base.repository");
const mongoose_1 = require("mongoose");
class SubscriptionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(subscription_model_1.default);
    }
    async findOneActiveByUser(userId) {
        const now = new Date();
        const subscription = await this.model.findOne({
            userId: new mongoose_1.Types.ObjectId(userId),
            status: "active",
            expiryDate: { $gt: now },
        })
            .populate({
            path: "planId",
            match: { active: true },
        })
            .lean();
        if (!subscription || !subscription.planId) {
            return null;
        }
        return subscription;
    }
    async findExpiredActive() {
        return this.model.find({
            status: "active",
            expiryDate: { $lt: new Date() },
        });
    }
    async expireById(subscriptionId, session) {
        await this.model.updateOne({ _id: subscriptionId }, { $set: { status: "expired" } }, { session });
    }
}
exports.SubscriptionRepository = SubscriptionRepository;
