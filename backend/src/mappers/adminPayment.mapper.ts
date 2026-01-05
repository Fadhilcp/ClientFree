import { IPaymentDocument } from "../types/payment/payment.type";
import { AdminPaymentDto } from "../dtos/adminPayment.dto";

export function mapAdminPayment(payment: IPaymentDocument): AdminPaymentDto {
  const user =
    payment.userId && typeof payment.userId === "object"
      ? {
          id: (payment.userId as any)._id.toString(),
          name: (payment.userId as any).name,
          email: (payment.userId as any).email,
          role: (payment.userId as any).role,
        }
      : undefined;

  return {
    id: payment._id.toString(),
    type: payment.type,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency ?? "INR",

    provider: payment.provider,
    method: payment.method,

    referenceId: payment.referenceId,
    createdAt: payment.createdAt.toISOString(),

    user,
  };
}
