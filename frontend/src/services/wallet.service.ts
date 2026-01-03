import { endPoints } from '../config/endpoints'
import axios from '../lib/axios'

class WalletService {
    getWalletDetails(page: number, limit: number){
        return axios.get(endPoints.WALLET.GET(page, limit));
    }

    getEscrowDetails(page: number, limit: number){
        return axios.get(endPoints.WALLET.GET_ESCROW(page, limit));
    }

    getTransactions(page: number, limit: number){
        return axios.get(endPoints.WALLET.GET_TRANSACTIONS(page, limit));
    }

    getInvoices(page: number, limit: number){
        return axios.get(endPoints.WALLET.GET_INVOICES(page, limit));
    }

    downloadInvoice(transactionId: string){
        return axios.get(endPoints.WALLET.INVOICE_DOWNLOAD(transactionId), { responseType: "arraybuffer" });
    }

    getReport(from: string, to: string){
        return axios.get(endPoints.WALLET.GET_REPORT(from, to));
    }

    getEscrowAndMilestones(page: number, limit: number){
        return axios.get(endPoints.ASSIGNMENT.GET_ESCROW_MILESTONES(page, limit));
    }

    getPaymentOverview(){
        return axios.get(endPoints.DASHBOARD.GET_PAYMENTS_OVERVIEW)
    }

    getAllUserWallets(search: string, page: number, limit: number){
        return axios.get(endPoints.WALLET.GET_ALL_WALLETS(search, page , limit))
    }

    getAllUserWalletsTransactions(walletId: string, search?: string, page?: number, limit?: number){
        return axios.get(endPoints.WALLET.GET_USER_WALLET_TRANSACTIONS(walletId, search, page, limit));
    }
}

export const walletService = new WalletService();