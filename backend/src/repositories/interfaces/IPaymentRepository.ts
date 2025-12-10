import { IPaymentDocument } from "types/payment.type";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery } from "mongoose";

export interface IPaymentRepository extends IBaseRepository<IPaymentDocument>{

    findDisputes(filter: FilterQuery<IPaymentDocument>): Promise<IPaymentDocument[]>;
};