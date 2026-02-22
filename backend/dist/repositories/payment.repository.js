"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const base_repository_1 = require("./base.repository");
const payment_model_1 = __importDefault(require("../models/payment.model"));
class PaymentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(payment_model_1.default);
    }
    async findDisputes(filter) {
        return this.model.find(filter)
            .populate("clientId", "name email")
            .populate("freelancerId", "name email")
            .populate("userId", "name email")
            .populate("jobId", "title")
            .sort({ createdAt: -1 });
    }
    async disputeByIdWithDetail(id) {
        return this.model.findById(id)
            .populate("clientId")
            .populate("freelancerId")
            .populate("userId")
            .populate("jobId")
            .exec();
    }
}
exports.PaymentRepository = PaymentRepository;
