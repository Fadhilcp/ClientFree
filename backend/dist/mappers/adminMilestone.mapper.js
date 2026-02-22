"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMilestoneMapper = void 0;
class AdminMilestoneMapper {
    static mapApproved(doc) {
        const m = doc.milestones;
        return {
            id: doc._id.toString(),
            milestoneId: m._id.toString(),
            assignmentId: doc._id.toString(),
            jobId: doc.jobId.toString(),
            freelancerId: doc.freelancerId.toString(),
            proposalId: doc.proposalId.toString(),
            paymentId: m.paymentId ? m.paymentId.toString() : null,
            title: m.title,
            description: m.description ?? null,
            amount: m.amount,
            status: m.status,
            submittedAt: m.submittedAt ? m.submittedAt.toISOString() : null,
            createdAt: m.createdAt.toISOString(),
            updatedAt: m.updatedAt.toISOString(),
        };
    }
    static mapList(list) {
        return list.map(item => this.mapApproved(item));
    }
}
exports.AdminMilestoneMapper = AdminMilestoneMapper;
