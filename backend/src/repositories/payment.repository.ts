import { IPaymentDocument } from "types/payment.type";
import { BaseRepository } from "./base.repository";
import paymentModel from "models/payment.model";
import { IPaymentRepository } from "./interfaces/IPaymentRepository";
import { FilterQuery } from "mongoose";

export class PaymentRepository 
   extends BaseRepository<IPaymentDocument>
      implements IPaymentRepository {
        
    constructor(){
        super(paymentModel);
    }

    async findDisputes(filter: FilterQuery<IPaymentDocument>): Promise<IPaymentDocument[]> {
        return this.model.find(filter)
        .populate("clientId", "name email")
        .populate("clientId", "name email")
        .populate("freelancerId", "name email")
        .populate("userId", "name email")
        .populate("jobId", "title")
        .sort({ createdAt: -1 });
    }
}