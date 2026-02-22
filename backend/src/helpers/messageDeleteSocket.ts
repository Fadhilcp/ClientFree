import { getIO } from "../config/socket.config";

export const emitMessageDeleted = (
  chatId: string,
  messageId: string
) => {
  const io = getIO();

  io.to(`chat:${chatId}`).emit("chat:message:deleted", {
    messageId,
  });
};
