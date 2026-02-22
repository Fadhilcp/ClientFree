"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreelancerDashboardService = void 0;
const walletTransaction_mapper_1 = require("../mappers/walletTransaction.mapper");
class FreelancerDashboardService {
    constructor(_walletTransactionRepository, _jobassignmentRepository, _walletRepository) {
        this._walletTransactionRepository = _walletTransactionRepository;
        this._jobassignmentRepository = _jobassignmentRepository;
        this._walletRepository = _walletRepository;
    }
    ;
    async getPaymentOverview(userId) {
        const [wallet, pendingClearance, totalEarned, totalWithdrawn, earningGraph, recentTransactions] = await Promise.all([
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
            recentTransactions: recentTransactions.map(walletTransaction_mapper_1.mapWalletTransaction)
        };
    }
    normalizeGraph(rawData) {
        return rawData.map(item => ({
            month: item._id.month,
            year: item._id.year,
            total: item.total
        }));
    }
}
exports.FreelancerDashboardService = FreelancerDashboardService;
