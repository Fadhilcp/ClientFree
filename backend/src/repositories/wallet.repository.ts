import { BaseRepository } from "./base.repository";
import walletModel from "models/wallet.model";
import { IWalletDocument } from "types/wallet.type";
import { IWalletRepository } from "./interfaces/IWalletRepository";

export class WalletRepository 
    extends BaseRepository<IWalletDocument> 
        implements IWalletRepository {

        constructor(){
            super(walletModel)
        }
}