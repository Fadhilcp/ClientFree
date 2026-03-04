"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitChatLastMessage = void 0;
const socket_config_1 = require("../config/socket.config");
const emitChatLastMessage = (chatId, participants, lastMessageAt) => {
    const io = (0, socket_config_1.getIO)();
    participants.forEach(userId => {
        io.to(`user:${userId}`).emit("chat:last-message", {
            chatId,
            lastMessageAt,
        });
    });
};
exports.emitChatLastMessage = emitChatLastMessage;
