"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitMessageToChat = void 0;
const socket_config_1 = require("../config/socket.config");
const emitMessageToChat = async (chatId, message) => {
    const io = (0, socket_config_1.getIO)();
    io.to(`chat:${chatId}`).emit("chat:message", {
        id: message._id.toString(),
        chatId: message.chatId.toString(),
        senderId: message.senderId.toString(),
        type: message.type,
        content: message.content,
        file: message.file,
        voice: message.voice,
        callDetails: message.callDetails,
        createdAt: message.createdAt?.toISOString(),
    });
};
exports.emitMessageToChat = emitMessageToChat;
