import { IWalletTransactionRepository } from "repositories/interfaces/IWalletTransactionRepository";
import { IDashBoardOverviewService } from "./interface/IDashboardService";
import { IJobAssignmentRepository } from "repositories/interfaces/IJobAssignmentRepository";
import { IWalletRepository } from "repositories/interfaces/IWalletRepository";
import { FreelancerPaymentOverviewDTO } from "dtos/paymentOverview.dto";
import { mapWalletTransaction } from "mappers/walletTransaction.mapper";

export class FreelancerDashboardService implements IDashBoardOverviewService<FreelancerPaymentOverviewDTO> {

    constructor(
        private _walletTransactionRepository: IWalletTransactionRepository,
        private _jobassignmentRepository: IJobAssignmentRepository,
        private _walletRepository: IWalletRepository,
    ){};

    async getPaymentOverview(userId: string): Promise<FreelancerPaymentOverviewDTO> {
        
        const [
            wallet,
            pendingClearance,
            totalEarned,
            totalWithdrawn,
            earningGraph,
            recentTransactions
        ] = await Promise.all([
            this._walletRepository.findOne({ userId }),
            this._jobassignmentRepository.getPendingClearanceByFreelancer(userId),
            this._walletTransactionRepository.getTotalEarnedByFreelancer(userId),
            this._walletTransactionRepository.getTotalWithdrawnByFreelancer(userId),
            this._walletTransactionRepository.getFreelancerEarningGraph(userId),
            this._walletTransactionRepository.find({ userId }, { sort: { createdAt: -1 }, limit: 10 })
        ]);

        return {
            walletBalance: wallet?.balance.available ?? 0,
            pendingClearance,
            totalEarned,
            totalWithdrawn,
            paymentGraph: this.normalizeGraph(earningGraph),
            recentTransactions: recentTransactions.map(mapWalletTransaction)
        };
    }

    private normalizeGraph(rawData: any[]) {
        
        return rawData.map(item => ({
            month: item._id.month,
            year: item._id.year,
            total: item.total
        }));
    }
}