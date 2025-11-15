import { IPaymentDocument } from "types/payment.type";
import { IBaseRepository } from "./IBaseRepository";

// export interface IPaymentRepository extends IBaseRepository<IPaymentDocument>{};

export type IPaymentRepository = IBaseRepository<IPaymentDocument>;