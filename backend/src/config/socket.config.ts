import { Server } from "socket.io";
import http from "http";
import { socketAuthMiddleware } from "middlewares/socketAuth.middleware";
import { env } from "./env.config";
import { registerCallSocket } from "sockets/call.socket";
import { userConnected, userDisconnected, isUserOnline } from "sockets/presence.socket";

let io: Server;

export const initSocket = (server: http.Server): Server => {

    io = new Server(server, {
        cors: {
            origin: env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    io.use(socketAuthMiddleware);

    io.on("connection", (socket) => {
        const { _id, role } = socket.data.user;

        socket.join(`user:${_id}`);
        socket.join(`role:${role}`);

        userConnected(_id);

        socket.broadcast.emit("user:online", { userId: _id });

        // Chat rooms
        socket.on("chat:join", (chatId: string) => {
            socket.join(`chat:${chatId}`);
        });

        registerCallSocket(io, socket);

        socket.on("chat:leave", (chatId: string) => {
            socket.leave(`chat:${chatId}`);
        });

        // Typing indicator
        socket.on("chat:typing:start", ({ chatId }: { chatId: string }) => {
            socket.to(`chat:${chatId}`).emit("chat:typing", {
                chatId,
                userId: _id,
                isTyping: true,
            });
        });

        socket.on("chat:typing:stop", ({ chatId }: { chatId: string }) => {
            socket.to(`chat:${chatId}`).emit("chat:typing", {
                chatId,
                userId: _id,
                isTyping: false,
            });
        });

        // Read receipt relay 
        socket.on("chat:read", ({ chatId }: { chatId: string }) => {
            socket.to(`chat:${chatId}`).emit("chat:read", {
                chatId,
                userId: _id,
            });
        });

        socket.on("disconnect", () => {
            userDisconnected(_id);

            if(!isUserOnline(_id)) {
                socket.broadcast.emit("user:offline", { userId: _id });
            }
        });
    });

    return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};