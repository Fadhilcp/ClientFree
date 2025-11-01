import { IPaymentDocument } from "types/payment.type";
import { BaseRepository } from "./base.repository";
import paymentModel from "models/payment.model";
import { IPaymentRepository } from "./interfaces/IPaymentRepository";

export class PaymentRepository 
   extends BaseRepository<IPaymentDocument>
      implements IPaymentRepository {
        
    constructor(){
        super(paymentModel);
    }
}