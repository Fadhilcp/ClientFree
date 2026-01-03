// mappers/adminWallet.mapper.ts
import { IWalletDocument } from "types/wallet.type";
import { WalletDTO } from "dtos/wallet.dto";
import { IUserDocument } from "types/user.type";

type WalletWithPopulatedUserId = IWalletDocument & {
  userId: IUserDocument;
};

type WalletWithAggregatedUser = IWalletDocument & {
  user: IUserDocument;
};

type WalletPersistence =
  | WalletWithPopulatedUserId
  | WalletWithAggregatedUser;

export function mapWallet(wallet: WalletPersistence): WalletDTO {
    const user = 'user' in wallet ? wallet.user : wallet.userId;

  if (!user || !user?._id) {
    throw new Error("AdminWalletMapper: user not populated");
  }

  return {
    id: wallet._id.toString(),

    currency: wallet.currency,
    status: wallet.status,
    role: wallet.role,

    balance: {
      available: wallet.balance.available,
      escrow: wallet.balance.escrow,
      pending: wallet.balance.pending,
    },

    user: {
      id: user._id.toString(),
      name: user.name ?? "",
      email: user.email,
      role: user.role,
    },

    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
}
