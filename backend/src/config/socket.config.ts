import { Server } from "socket.io";
import http from "http";
import { socketAuthMiddleware } from "middlewares/socketAuth.middleware";
import { env } from "./env.config";

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

        // Chat rooms
        socket.on("chat:join", (chatId: string) => {
            socket.join(`chat:${chatId}`);
        });

        socket.on("chat:leave", (chatId: string) => {
            socket.leave(`chat:${chatId}`);
        });

        // Typing indicator
        socket.on("chat:typing", ({ chatId }: { chatId: string }) => {
            socket.to(`chat:${chatId}`).emit("chat:typing", {
                userId: _id,
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
            console.log(`Socket disconnected: ${_id}`);
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