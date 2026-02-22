"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRecipientRepository = void 0;
const base_repository_1 = require("./base.repository");
const notificationRecipient_model_1 = __importDefault(require("../models/notificationRecipient.model"));
class NotificationRecipientRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(notificationRecipient_model_1.default);
    }
    async insertMany(data) {
        if (!data.length)
            return;
        await this.model.insertMany(data, { ordered: false });
    }
    async getUserNotificationsPaginated(userId, page = 1, limit = 10) {
        return this.paginate({ userId }, {
            page,
            limit,
            sort: { createdAt: -1 },
            populate: {
                path: "notificationId",
                match: { isDeleted: false },
            },
        });
    }
    async markAsRead(notificationId, userId) {
        return this.model.findOneAndUpdate({ notificationId, userId }, { isRead: true, readAt: new Date() }, { new: true }).populate("notificationId");
    }
}
exports.NotificationRecipientRepository = NotificationRecipientRepository;
