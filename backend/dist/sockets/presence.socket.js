"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserOnline = exports.userDisconnected = exports.userConnected = void 0;
const onlineUsers = new Map();
const userConnected = (userId) => {
    onlineUsers.set(userId, (onlineUsers.get(userId) ?? 0) + 1);
};
exports.userConnected = userConnected;
const userDisconnected = (userId) => {
    const count = onlineUsers.get(userId);
    if (!count)
        return;
    if (count === 1)
        onlineUsers.delete(userId);
    else
        onlineUsers.set(userId, count - 1);
};
exports.userDisconnected = userDisconnected;
const isUserOnline = (userId) => onlineUsers.has(userId);
exports.isUserOnline = isUserOnline;
