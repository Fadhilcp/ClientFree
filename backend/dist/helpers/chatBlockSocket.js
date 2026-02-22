"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitChatBlocked = emitChatBlocked;
const socket_config_1 = require("../config/socket.config");
function emitChatBlocked(chatId, payload) {
    const io = (0, socket_config_1.getIO)();
    io.to(`chat:${chatId}`).emit("chat:block-status", payload);
}
