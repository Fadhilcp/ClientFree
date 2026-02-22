"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientDashboardService = void 0;
const walletTransaction_mapper_1 = require("../mappers/walletTransaction.mapper");
class ClientDashboardService {
    constructor(_walletTransactionRepository, _jobassignmentRepository, _walletRepository) {
        this._walletTransactionRepository = _walletTransactionRepository;
        this._jobassignmentRepository = _jobassignmentRepository;
        this._walletRepository = _walletRepository;
    }
    ;
    async getPaymentOverview(userId) {
        const [wallet, releasedPayments, pendingPayments, upcomingMilestones, paymentGraph, recentTransactions] = await Promise.all([
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
            recentTransactions: recentTransactions.map(walletTransaction_mapper_1.mapWalletTransaction)
        };
    }
    normalizeGraph(rawData) {
        return rawData.map(item => ({
            month: item._id.month,
            year: item._id.year,
            type: item._id.type,
            total: item.total
        }));
    }
}
exports.ClientDashboardService = ClientDashboardService;
