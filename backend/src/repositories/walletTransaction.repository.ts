import { BaseRepository } from "./base.repository";
import walletTransactionModel from "models/walletTransaction.model";
import { IWalletTransactionDocument } from "types/walletTransaction.type";
import { IWalletTransactionRepository } from "./interfaces/IWalletTransactionRepository";

export class WalletTransactionRepository 
    extends BaseRepository<IWalletTransactionDocument> 
        implements IWalletTransactionRepository {

        constructor(){
            super(walletTransactionModel)
        }
}