"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const base_repository_1 = require("./base.repository");
const notification_model_1 = __importDefault(require("../models/notification.model"));
class NotificationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(notification_model_1.default);
    }
}
exports.NotificationRepository = NotificationRepository;
