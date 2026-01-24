import { MessageController } from "controllers/message.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import { ChatRepository } from "repositories/chat.repository";
import { MessageRepository } from "repositories/message.repository";
import { MessageService } from "services/message.service";

const messageRouter = Router();

const chatRepository = new ChatRepository();
const messageRepository = new MessageRepository();

const messageService = new MessageService(chatRepository, messageRepository);

const messageController = new MessageController(messageService);

messageRouter.use(authMiddleware, verifyUserNotBanned);

messageRouter.post('/:chatId',messageController.sendMessage.bind(messageController));
messageRouter.get('/:chatId',messageController.getChatMessages.bind(messageController));
messageRouter.patch('/:chatId/read',messageController.markAsRead.bind(messageController));

export default messageRouter;