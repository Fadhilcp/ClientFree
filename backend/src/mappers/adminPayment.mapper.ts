import { IPaymentDocument } from "../types/payment/payment.type";
import { AdminPaymentDto } from "../dtos/adminPayment.dto";
import { IUserDocument } from "../types/user.type";

export function mapAdminPayment(payment: IPaymentDocument): AdminPaymentDto {
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
    type: payment.type,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency ?? "INR",

    provider: payment.provider,
    method: payment.method,

    referenceId: payment.referenceId,
    createdAt: payment.createdAt.toISOString(),
    user: {
      id: userId,
      name: userDoc?.name ?? "",
      email: userDoc?.email ?? "",
      role: userDoc?.role ?? "",
    },
  };
}
