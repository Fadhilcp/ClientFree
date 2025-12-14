import { IPaymentDocument } from "types/payment.type";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery, ObjectId } from "mongoose";

export interface IPaymentRepository extends IBaseRepository<IPaymentDocument>{

    findDisputes(filter: FilterQuery<IPaymentDocument>): Promise<IPaymentDocument[]>;
    disputeByIdWithDetail(id: string | ObjectId): Promise<IPaymentDocument | null>;
};