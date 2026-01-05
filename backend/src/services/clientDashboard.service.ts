import { IWalletTransactionRepository } from "../repositories/interfaces/IWalletTransactionRepository";
import { IDashBoardOverviewService } from "./interface/IDashboardService";
import { IJobAssignmentRepository } from "../repositories/interfaces/IJobAssignmentRepository";
import { IWalletRepository } from "../repositories/interfaces/IWalletRepository";
import { ClientPaymentOverviewDTO } from "../dtos/paymentOverview.dto";
import { mapWalletTransaction } from "../mappers/walletTransaction.mapper";

export class ClientDashboardService implements IDashBoardOverviewService<ClientPaymentOverviewDTO> {
    constructor(
        private _walletTransactionRepository: IWalletTransactionRepository,
        private _jobassignmentRepository: IJobAssignmentRepository,
        private _walletRepository: IWalletRepository,
    ){};

    async getPaymentOverview(userId: string): Promise<ClientPaymentOverviewDTO> {
        
        const [
            wallet,
            releasedPayments,
            pendingPayments,
            upcomingMilestones,
            paymentGraph,
            recentTransactions
        ] = await Promise.all([
            this._walletRepository.findOne({ userId }),
            this._walletTransactionRepository.getTotalReleasedByClient(userId),
            this._walletTransactionRepository.getClientPendingPayments(userId),
            this._jobassignmentRepository.countUpcomingClientMilestones(userId),
            this._walletTransactionRepository.getClientPaymentGraph(userId),
            this._walletTransactionRepository.find({ userId }, { sort: { createdAt: -1 }, limit: 10 })
        ]);

        return {
            walletBalance: wallet?.balance.available ?? 0,
            pendingPayments,
            releasedPayments,
            upcomingMilestones,
            paymentGraph: this.normalizeGraph(paymentGraph),
            recentTransactions: recentTransactions.map(mapWalletTransaction)
        };
    }

    private normalizeGraph(rawData: any[]) {
        
        return rawData.map(item => ({
            month: item._id.month,
            year: item._id.year,
            type: item._id.type,
            total: item.total
        }));
    }
}