import { IBaseRepository } from "./IBaseRepository";
import { IWalletTransactionDocument } from "types/walletTransaction.type";

// export interface IWalletTransactionRepository extends IBaseRepository<IWalletTransactionDocument> {};

export type IWalletTransactionRepository = IBaseRepository<IWalletTransactionDocument>;