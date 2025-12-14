import { PaymentController } from "controllers/payment.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import { JobRepository } from "repositories/job.repository";
import { JobAssignmentRepository } from "repositories/jobAssignment.repository";
import { PaymentRepository } from "repositories/payment.repository";
import { PaymentService } from "services/payment.service";

const paymentRepository = new PaymentRepository();
const jobAssignmentRepository = new JobAssignmentRepository();
const jobRepository = new JobRepository();

const paymentService = new PaymentService(paymentRepository, jobAssignmentRepository, jobRepository);
const paymentController = new PaymentController(paymentService);

const paymentRouter = Router();

// paymentRouter.use(authMiddleware, verifyUserNotBanned);

paymentRouter.post('/milestones/:assignmentId/:milestoneId/fund',
    paymentController.createOrder.bind(paymentController)
);
paymentRouter.post('/verify',paymentController.verifyPayment.bind(paymentController));
paymentRouter.get('/disputes',paymentController.getAllDisputes.bind(paymentController));
paymentRouter.get('/:paymentId/dispute',paymentController.getDisputeById.bind(paymentController));
paymentRouter.post('/:paymentId/refund',paymentController.refund.bind(paymentController));
paymentRouter.post('/:paymentId/release',paymentController.release.bind(paymentController));

export default paymentRouter;