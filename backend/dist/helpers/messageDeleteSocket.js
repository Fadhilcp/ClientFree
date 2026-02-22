"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitMessageDeleted = void 0;
const socket_config_1 = require("../config/socket.config");
const emitMessageDeleted = (chatId, messageId) => {
    const io = (0, socket_config_1.getIO)();
    io.to(`chat:${chatId}`).emit("chat:message:deleted", {
        messageId,
    });
};
exports.emitMessageDeleted = emitMessageDeleted;
