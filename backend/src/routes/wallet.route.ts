import { WalletController } from "controllers/wallet.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { authorizeRole } from "middlewares/authorizeRole";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import { MongooseSessionProvider } from "repositories/db/session-provider";
import { PaymentRepository } from "repositories/payment.repository";
import { WalletRepository } from "repositories/wallet.repository";
import { WalletTransactionRepository } from "repositories/walletTransaction.repository";
import { WalletService } from "services/wallet.service";

const walletRouter = Router();

const walletRepository = new WalletRepository();
const walletTransactionRepository = new WalletTransactionRepository();

const walletService = new WalletService(
    walletRepository, 
    walletTransactionRepository,
);

const walletController = new WalletController(walletService);

walletRouter.use(authMiddleware, verifyUserNotBanned);

walletRouter.get("/me",walletController.getWallet.bind(walletController));
walletRouter.get("/escrow",walletController.getEscrowDetails.bind(walletController));
walletRouter.get("/transactions",walletController.getTransactions.bind(walletController));

walletRouter.get("/",authorizeRole("admin"),walletController.getAllUserWallets.bind(walletController));
walletRouter.get("/:walletId/transactions",authorizeRole("admin"),walletController.getAllUserWalletTransactions.bind(walletController));

walletRouter.get("/invoices",walletController.getInvoices.bind(walletController));
walletRouter.get("/invoices/:transactionId/download",walletController.downloadInvoice.bind(walletController));
walletRouter.get("/reports",walletController.getFinancialReport.bind(walletController));

export default walletRouter;