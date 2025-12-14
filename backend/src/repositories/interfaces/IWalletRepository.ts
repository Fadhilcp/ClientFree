import { ClientSession } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";
import { IWalletDocument } from "types/wallet.type";

export interface IWalletRepository extends IBaseRepository<IWalletDocument> {
    createWithSession(data: Partial<IWalletDocument>, session: ClientSession): Promise<IWalletDocument>;
};