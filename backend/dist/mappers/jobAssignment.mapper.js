"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentMapper = void 0;
class AssignmentMapper {
    static mapMilestone(m) {
        return {
            id: m._id?.toString(),
            title: m.title,
            description: m.description ?? null,
            amount: m.amount,
            dueDate: m.dueDate ? m.dueDate.toISOString() : null,
            paymentId: m.paymentId ? m.paymentId.toString() : null,
            status: m.status,
            submissionMessage: m.submissionMessage ?? null,
            submissionFiles: m.submissionFiles?.map(f => ({
                url: f.url,
                name: f.name,
                type: f.type,
                key: f.key
            })) ?? [],
            submittedAt: m.submittedAt ? m.submittedAt.toISOString() : null,
            createdAt: m.createdAt ? m.createdAt.toISOString() : "",
            updatedAt: m.updatedAt ? m.updatedAt.toISOString() : ""
        };
    }
    static mapFreelancer(f) {
        return {
            id: f._id.toString(),
            username: f.username,
            name: f.name ?? '',
            email: f.email,
            profileImage: f.profileImage ?? '',
            phone: f.phone ?? '',
        };
    }
    static mapTask(t) {
        if (!t.id) {
            throw new Error("Task id is missing");
        }
        return {
            id: t.id,
            title: t.title ?? "",
            status: t.status ?? "pending",
            dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        };
    }
    static mapAssignment(a) {
        return {
            id: a._id.toString(),
            amount: a.amount,
            tasks: a.tasks ?? [],
            status: a.status,
            createdAt: a.createdAt?.toISOString() ?? "",
            updatedAt: a.updatedAt?.toISOString() ?? "",
            milestones: a.milestones?.map((m) => this.mapMilestone(m)) ?? [],
            freelancer: this.mapFreelancer(a.freelancerId),
        };
    }
    static mapList(assignments) {
        return assignments.map(a => this.mapAssignment(a));
    }
}
exports.AssignmentMapper = AssignmentMapper;
