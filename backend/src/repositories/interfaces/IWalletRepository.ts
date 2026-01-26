import { FilterQuery } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";
import { IWalletDocument } from "../../types/wallet.type";
import { IUserDocument } from "../../types/user.type";

export interface IWalletRepository extends IBaseRepository<IWalletDocument> {
    getAllWalletsAggregate(search: string, page: number, limit: number)
        : Promise<{ wallets: (IWalletDocument & {user: IUserDocument})[], total: number, totalPages: number }>;
    findOneWithUser(filter: FilterQuery<IWalletDocument>): Promise<IWalletDocument & {userId: IUserDocument} | null>;
};