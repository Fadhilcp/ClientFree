"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCallSocket = void 0;
const registerCallSocket = (io, socket) => {
    socket.on("call:offer", async ({ chatId, offer, receiverId }) => {
        socket.to(`user:${receiverId}`).emit("call:offer", {
            chatId,
            offer,
            from: socket.data.user._id,
        });
    });
    socket.on("call:reject", ({ receiverId }) => {
        socket.to(`user:${receiverId}`).emit("call:reject");
    });
    socket.on("call:answer", ({ receiverId, answer }) => {
        socket.to(`user:${receiverId}`).emit("call:answer", { answer });
    });
    socket.on("call:ice-candidate", ({ receiverId, candidate }) => {
        socket.to(`user:${receiverId}`).emit("call:ice-candidate", { candidate });
    });
    socket.on("call:end", ({ receiverId }) => {
        socket.to(`user:${receiverId}`).emit("call:end");
    });
};
exports.registerCallSocket = registerCallSocket;
