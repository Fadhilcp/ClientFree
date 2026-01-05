import { Aggregate, ClientSession, FilterQuery, Types } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";
import { IWalletTransactionDocument } from "../../types/walletTransaction.type";
import { FinancialReportSummary } from "../../types/wallet.type";

export interface IWalletTransactionRepository extends IBaseRepository<IWalletTransactionDocument> {
    createWithSession(
        data: Partial<IWalletTransactionDocument>, session: ClientSession
    ): Promise<IWalletTransactionDocument>;

    countTransactions(filter: FilterQuery<IWalletTransactionDocument>): Promise<number>;
    aggregateFinancialReport(walletId: string,  from: Date, to: Date)
      : Promise<FinancialReportSummary[]>;
      aggregateEscrowByAssignments(
            assignmentIds: Types.ObjectId[]
        ): Promise<{ _id: "escrow_hold" | "escrow_release"; total: number; }[]>

    getTotalReleasedByClient(userId: string): Promise<number>;
    getClientPendingPayments(clientId: string): Promise<number>;
    getClientPaymentGraph(userId: string): Promise<Aggregate<IWalletTransactionDocument[]>>;

    getTotalEarnedByFreelancer(userId: string): Promise<number>;
    getTotalWithdrawnByFreelancer(userId: string): Promise<number>;
    getFreelancerEarningGraph(userId: string): Promise<Aggregate<IWalletTransactionDocument[]>>;
};
