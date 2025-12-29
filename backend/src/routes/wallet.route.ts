import { WalletController } from "controllers/wallet.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";
import { MongooseSessionProvider } from "repositories/db/session-provider";
import { WalletRepository } from "repositories/wallet.repository";
import { WalletTransactionRepository } from "repositories/walletTransaction.repository";
import { WalletService } from "services/wallet.service";

const walletRouter = Router();

const walletRepository = new WalletRepository();
const walletTransactionRepository = new WalletTransactionRepository();
// transaction session
const sessionProvider = new MongooseSessionProvider;

const walletService = new WalletService(walletRepository, walletTransactionRepository, sessionProvider);

const walletController = new WalletController(walletService);

walletRouter.use(authMiddleware, verifyUserNotBanned);

walletRouter.get("/",walletController.getWallet.bind(walletController));
walletRouter.get("/escrow",walletController.getEscrowDetails.bind(walletController));
walletRouter.get("/transactions",walletController.getTransactions.bind(walletController));


walletRouter.get("/invoices",walletController.getInvoices.bind(walletController));
walletRouter.get("/invoices/:transactionId/download",walletController.downloadInvoice.bind(walletController));
walletRouter.get("/reports",walletController.getFinancialReport.bind(walletController));

walletRouter.post("/withdraw",walletController.withdraw.bind(walletController));
walletRouter.get("/withdrawals",walletController.getWithdrawals.bind(walletController));

export default walletRouter;