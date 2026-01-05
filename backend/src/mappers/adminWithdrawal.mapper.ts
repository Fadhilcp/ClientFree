import { AdminWithdrawalDTO } from "../dtos/adminWithdrawal.dto";
import { IPaymentDocument } from "../types/payment/payment.type";

export function mapAdminWithdrawal(
  payment: IPaymentDocument
): AdminWithdrawalDTO {

  const user = payment.userId as any;

  return {
    id: payment._id.toString(),

    amount: payment.amount,
    currency: payment.currency ?? "",

    status: payment.status,
    provider: payment.provider ?? "",
    method: payment.method,

    referenceId: payment.referenceId,
    providerPaymentId: payment.providerPaymentId,

    requestedAt: payment.createdAt,
    processedAt: payment.withdrawalDate,

    user: {
      id: user?._id?.toString(),
      name: user?.name,
      email: user?.email,
      role: user?.role,
    }
  };
}
