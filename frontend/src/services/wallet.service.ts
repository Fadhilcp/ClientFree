import { endPoints } from '../config/endpoints'
import axios from '../lib/axios'

class WalletService {
    async getWalletDetails(page: number, limit: number){
        return axios.get(endPoints.WALLET.GET(page, limit));
    }

    async getEscrowDetails(page: number, limit: number){
        return axios.get(endPoints.WALLET.GET_ESCROW(page, limit));
    }

    async getTransactions(page: number, limit: number){
        return axios.get(endPoints.WALLET.GET_TRANSACTIONS(page, limit));
    }

    async getInvoices(page: number, limit: number){
        return axios.get(endPoints.WALLET.GET_INVOICES(page, limit));
    }

    async downloadInvoice(transactionId: string){
        return axios.get(endPoints.WALLET.INVOICE_DOWNLOAD(transactionId), { responseType: "arraybuffer" });
    }

    async getReport(from: string, to: string){
        return axios.get(endPoints.WALLET.GET_REPORT(from, to));
    }

    async getWithdrawals(page: number, limit: number){
        return axios.get(endPoints.WALLET.GET_WITHDRAWALS(page, limit))
    }

    async getEscrowAndMilestones(page: number, limit: number){
        return axios.get(endPoints.ASSIGNMENT.GET_ESCROW_MILESTONES(page, limit));
    }

    async getPaymentOverview(){
        return axios.get(endPoints.DASHBOARD.GET_PAYMENTS_OVERVIEW)
    }

    async withdrawAmount(amount: number){
        return axios.post(endPoints.WALLET.WITHDRAW, { amount });
    }
}

export const walletService = new WalletService();