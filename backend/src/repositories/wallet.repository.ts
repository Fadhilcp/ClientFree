import { BaseRepository } from "./base.repository";
import walletModel from "models/wallet.model";
import { IWalletDocument } from "types/wallet.type";
import { IWalletRepository } from "./interfaces/IWalletRepository";
import { ClientSession } from "mongoose";

export class WalletRepository 
    extends BaseRepository<IWalletDocument> 
        implements IWalletRepository {

        constructor(){
            super(walletModel)
        }

    async createWithSession(data: Partial<IWalletDocument>, session: ClientSession): Promise<IWalletDocument> {
        const docs = await this.model.create([data], { session });
        return docs[0];
    }
}