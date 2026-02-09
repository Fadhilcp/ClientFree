import { Router } from "express";

import authRouter from "./auth.route";
import userRouter from "./user.route";
import skillRouter from "./skill.route";
import planRouter from "./plan.route";
import subscriptionRouter from "./subscription.route";
import jobRouter from "./job.route";
import proposalRouter from "./proposal.route";
import assignmentRouter from "./jobAssignment.route";
import paymentRouter from "./payment.route";
import addOnRouter from "./addOns.route";
import clarificationRouter from "./clarification.route";
import walletRouter from "./wallet.route";
import dashboardRouter from "./dashboard.route";
import matchRouter from "./match.route";
import notificationRouter from "./notification.route";
import chatRouter from "./chat.route";
import messageRouter from "./message.route";
import reviewRouter from "./review.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/skills", skillRouter);
router.use("/plans", planRouter);
router.use("/subscription", subscriptionRouter);
router.use("/jobs", jobRouter);
router.use("/proposal", proposalRouter);
router.use("/assignment", assignmentRouter);
router.use("/payment", paymentRouter);
router.use("/addOns", addOnRouter);
router.use("/clarification", clarificationRouter);
router.use("/wallet", walletRouter);
router.use("/dashboard", dashboardRouter);
router.use("/match", matchRouter);
router.use("/notification",notificationRouter);
router.use("/chats",chatRouter);
router.use("/messages",messageRouter);
router.use("/reviews",reviewRouter);

export default router;