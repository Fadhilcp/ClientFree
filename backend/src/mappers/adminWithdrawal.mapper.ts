import { IUserDocument } from "types/user.type";
import { AdminWithdrawalDTO } from "../dtos/adminWithdrawal.dto";
import { IPaymentDocument } from "../types/payment/payment.type";

export function mapAdminWithdrawal(
  payment: IPaymentDocument
): AdminWithdrawalDTO {

  const userDoc = payment.userId as unknown as Partial<IUserDocument>;

  const userId =
    userDoc?._id?.toString() ??
    (typeof payment.userId === "string"
      ? payment.userId
      : payment.userId?.toString());

  if (!userId) {
    throw new Error("Payment userId is missing");
  }

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
      id: userId,
      name: userDoc?.name ?? "",
      email: userDoc?.email ?? "",
      role: userDoc?.role ?? "",
    },
  };
}
