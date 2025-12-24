import { IPaymentDocument } from "types/payment/payment.type";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery, ObjectId } from "mongoose";
import { PopulatedPayment } from "types/payment/payment.populated";

export interface IPaymentRepository extends IBaseRepository<IPaymentDocument>{

    findDisputes(filter: FilterQuery<IPaymentDocument>): Promise<IPaymentDocument[]>;
    disputeByIdWithDetail(id: string | ObjectId): Promise<PopulatedPayment | null>;
};