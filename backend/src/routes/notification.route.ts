import { NotificationController } from "../controllers/notification.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationRecipientRepository } from "../repositories/notificationRecipient.repository";
import { UserRepository } from "../repositories/user.repository";
import { NotificationService } from "../services/notification.service";
import { authorizeRole } from "middlewares/authorizeRole";

const notificationRouter = Router();

const notificationRepository = new NotificationRepository();
const notificationRecipientRepository = new NotificationRecipientRepository();
const userRepository = new UserRepository();

const notificationService = new NotificationService(
    notificationRepository,
    notificationRecipientRepository,
    userRepository,
);

const notificationController = new NotificationController(notificationService);

notificationRouter.post("/",notificationController.create.bind(notificationController));
notificationRouter.use(authMiddleware, verifyUserNotBanned);

notificationRouter.get("/unread-count",notificationController.countUnread.bind(notificationController));
notificationRouter.patch("/read-all",notificationController.markAllAsRead.bind(notificationController));
notificationRouter.get("/me",notificationController.getMyNotifications.bind(notificationController));

notificationRouter.get("/admin",authorizeRole("admin"),notificationController.getAdminNotifications.bind(notificationController));

notificationRouter.put("/:notificationId",notificationController.update.bind(notificationController));
notificationRouter.delete("/:notificationId",notificationController.delete.bind(notificationController));
notificationRouter.patch("/:notificationId/read",notificationController.markRead.bind(notificationController));

export default notificationRouter;
