"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const base_repository_1 = require("./base.repository");
const message_model_1 = __importDefault(require("../models/message.model"));
class MessageRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(message_model_1.default);
    }
}
exports.MessageRepository = MessageRepository;
