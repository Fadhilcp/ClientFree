import { PaymentController } from "controllers/payment.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
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

paymentRouter.post('/milestones/:assignmentId/:milestoneId/fund',
    authMiddleware, paymentController.createOrder.bind(paymentController)
);
paymentRouter.post('/verify',authMiddleware,paymentController.verifyPayment.bind(paymentController));
paymentRouter.get('/disputes',authMiddleware,paymentController.getAllDisputes.bind(paymentController));
paymentRouter.post('/:paymentId/refund',authMiddleware,paymentController.refund.bind(paymentController));
paymentRouter.post('/:paymentId/release',authMiddleware,paymentController.release.bind(paymentController));

export default paymentRouter;