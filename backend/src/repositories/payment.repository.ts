import { IPaymentDocument } from "../types/payment/payment.type";
import { BaseRepository } from "./base.repository";
import paymentModel from "../models/payment.model";
import { IPaymentRepository } from "./interfaces/IPaymentRepository";
import { FilterQuery, ObjectId } from "mongoose";
import { IPopulatedPaymentDocument, PopulatedPayment } from "../types/payment/payment.populated";

export class PaymentRepository 
   extends BaseRepository<IPaymentDocument>
      implements IPaymentRepository {
        
    constructor(){
        super(paymentModel);
    }

    async findDisputes(filter: FilterQuery<IPaymentDocument>): Promise<IPaymentDocument[]> {
        return this.model.find(filter)
        .populate("clientId", "name email")
        .populate("freelancerId", "name email")
        .populate("userId", "name email")
        .populate("jobId", "title")
        .sort({ createdAt: -1 });
    }

    async disputeByIdWithDetail(id: string | ObjectId): Promise<PopulatedPayment | null> {
        return this.model.findById(id)
        .populate("clientId")
        .populate("freelancerId")
        .populate("userId")
        .populate("jobId")
        .exec() as Promise<PopulatedPayment | null>;
    }

    async getRecentPayments(limit = 10): Promise<IPopulatedPaymentDocument[]> {
        const payments = await this.model
            .find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate<{ clientId: { _id: string; username: string } | null }>("clientId", "username")
            .populate<{ freelancerId: { _id: string; username: string } | null }>("freelancerId", "username");

        return payments;
    }
}