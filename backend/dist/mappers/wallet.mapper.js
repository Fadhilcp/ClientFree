"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapWallet = mapWallet;
function mapWallet(wallet) {
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
