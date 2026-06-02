import { IUserDocument } from "../types/user.type";
import { IPopulatedPaymentDocument } from "../types/payment/payment.populated";
import { RecentUserDTO, RecentPaymentDTO } from "../dtos/adminDashboard.dto";

class AdminDashboardMapper {

    toRecentUser(user: IUserDocument): RecentUserDTO {
        return {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            isVerified: user.isVerified || false,
            createdAt: user.createdAt!,
        };
    }

    toRecentUserList(users: IUserDocument[]): RecentUserDTO[] {
        return users.map((u) => this.toRecentUser(u));
    }

    toRecentPayment(payment: IPopulatedPaymentDocument): RecentPaymentDTO {
        const client = payment.clientId as { _id: string; username: string } | null;
        const freelancer = payment.freelancerId as { _id: string; username: string } | null;

        return {
            _id: payment._id.toString(),
            type: payment.type,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency || "",
            clientId: client ? client._id.toString() : null,
            clientName: client ? client.username : null,
            freelancerId: freelancer ? freelancer._id.toString() : null,
            freelancerName: freelancer ? freelancer.username : null,
            createdAt: payment.createdAt!,
        };
    }

    toRecentPaymentList(payments: IPopulatedPaymentDocument[]): RecentPaymentDTO[] {
        return payments.map((p) => this.toRecentPayment(p));
    }
}

export default new AdminDashboardMapper();