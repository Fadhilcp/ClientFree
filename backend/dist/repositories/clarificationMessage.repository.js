"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClarificationMessageRepository = void 0;
const base_repository_1 = require("./base.repository");
const clarificationMessage_model_1 = __importDefault(require("../models/clarificationMessage.model"));
class ClarificationMessageRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(clarificationMessage_model_1.default);
    }
    async createAndPopulate(messageData) {
        const created = await this.model.create(messageData);
        return this.model
            .findById(created._id)
            .populate({
            path: "senderId",
            select: "username name email profileImage role"
        });
    }
    async findSortedMessages(filter) {
        return this.model.find(filter)
            .sort({ createdAt: 1 })
            .populate({
            path: "senderId",
            select: "username name email profileImage role"
        });
    }
}
exports.ClarificationMessageRepository = ClarificationMessageRepository;
