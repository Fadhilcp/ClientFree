import { WalletController } from "../controllers/wallet.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/authorizeRole";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";
import { WalletRepository } from "../repositories/wallet.repository";
import { WalletTransactionRepository } from "../repositories/walletTransaction.repository";
import { WalletService } from "../services/wallet.service";
import { UserRole } from "../constants/user.constants";

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

walletRouter.get("/",authorizeRole(UserRole.ADMIN),walletController.getAllUserWallets.bind(walletController));
walletRouter.get("/:walletId/transactions",authorizeRole(UserRole.ADMIN),walletController.getAllUserWalletTransactions.bind(walletController));

walletRouter.get("/invoices",walletController.getInvoices.bind(walletController));
walletRouter.get("/invoices/:transactionId/download",walletController.downloadInvoice.bind(walletController));
walletRouter.get("/reports",walletController.getFinancialReport.bind(walletController));

export default walletRouter;