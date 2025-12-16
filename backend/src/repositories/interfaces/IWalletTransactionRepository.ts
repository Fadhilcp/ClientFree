import { ClientSession } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";
import { IWalletTransactionDocument } from "types/walletTransaction.type";

export interface IWalletTransactionRepository extends IBaseRepository<IWalletTransactionDocument> {
    createWithSession(
        data: Partial<IWalletTransactionDocument>, session: ClientSession
    ): Promise<IWalletTransactionDocument>;
};
