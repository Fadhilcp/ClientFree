import { WalletTransactionDTO } from "../dtos/walletTransaction.dto";
import { IWalletTransactionDocument } from "../types/walletTransaction.type";

export function mapWalletTransaction(transaction: IWalletTransactionDocument): WalletTransactionDTO {
    return {
        id: transaction._id.toString(),
        type: transaction.type,
        direction: transaction.direction,
        amount: transaction.amount,
        currency: transaction.currency,
        balanceAfter: transaction.balanceAfter,
        paymentId: transaction.paymentId?.toString(),
        status: transaction.status,
        createdAt: transaction.createdAt,
    };
}