"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const socketAuth_middleware_1 = require("../middlewares/socketAuth.middleware");
const env_config_1 = require("./env.config");
const call_socket_1 = require("../sockets/call.socket");
const presence_socket_1 = require("../sockets/presence.socket");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: env_config_1.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        }
    });
    io.use(socketAuth_middleware_1.socketAuthMiddleware);
    io.on("connection", (socket) => {
        const { _id, role } = socket.data.user;
        socket.join(`user:${_id}`);
        socket.join(`role:${role}`);
        (0, presence_socket_1.userConnected)(_id);
        socket.emit("presence:init", {
            onlineUserIds: (0, presence_socket_1.getOnlineUserIds)(),
        });
        socket.broadcast.emit("user:online", { userId: _id });
        // Chat rooms
        socket.on("chat:join", (chatId) => {
            socket.join(`chat:${chatId}`);
        });
        (0, call_socket_1.registerCallSocket)(io, socket);
        socket.on("chat:leave", (chatId) => {
            socket.leave(`chat:${chatId}`);
        });
        // Typing indicator
        socket.on("chat:typing:start", ({ chatId }) => {
            socket.to(`chat:${chatId}`).emit("chat:typing", {
                chatId,
                userId: _id,
                isTyping: true,
            });
        });
        socket.on("chat:typing:stop", ({ chatId }) => {
            socket.to(`chat:${chatId}`).emit("chat:typing", {
                chatId,
                userId: _id,
                isTyping: false,
            });
        });
        // Read receipt relay 
        socket.on("chat:read", ({ chatId }) => {
            socket.to(`chat:${chatId}`).emit("chat:read", {
                chatId,
                userId: _id,
            });
        });
        socket.on("disconnect", () => {
            (0, presence_socket_1.userDisconnected)(_id);
            if (!(0, presence_socket_1.isUserOnline)(_id)) {
                socket.broadcast.emit("user:offline", { userId: _id });
            }
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
exports.getIO = getIO;
