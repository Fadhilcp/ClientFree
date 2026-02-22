"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminApprovedMilestoneDetailMapper = void 0;
class AdminApprovedMilestoneDetailMapper {
    static map(doc) {
        const m = doc.milestones[0];
        if (!m)
            throw new Error("Milestone missing in detail mapper");
        return {
            assignmentId: doc._id.toString(),
            job: {
                id: doc.jobId._id.toString(),
                title: doc.jobId.title,
                payment: {
                    budget: doc.jobId.payment?.budget ?? 0,
                    type: doc.jobId.payment?.type ?? ""
                }
            },
            freelancer: {
                id: doc.freelancerId._id.toString(),
                name: doc.freelancerId.name,
                email: doc.freelancerId.email
            },
            milestone: {
                id: m._id.toString(),
                title: m.title,
                description: m.description ?? undefined,
                amount: m.amount,
                status: m.status,
                submittedAt: m.submittedAt ?? undefined,
                submissionMessage: m.submissionMessage ?? undefined,
                submissionFiles: m.submissionFiles ?? []
            },
            payment: m.paymentId
                ? {
                    id: m.paymentId._id.toString(),
                    status: m.paymentId.status,
                    amount: m.paymentId.amount,
                    currency: m.paymentId.currency,
                    provider: m.paymentId.provider,
                    method: m.paymentId.method,
                    paymentDate: m.paymentId.paymentDate
                }
                : null
        };
    }
}
exports.AdminApprovedMilestoneDetailMapper = AdminApprovedMilestoneDetailMapper;
