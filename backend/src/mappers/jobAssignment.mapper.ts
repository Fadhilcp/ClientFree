import { FreelancerProfileDto } from "dtos/freelancerProfile.dto";
import { AssignmentDto, FreelancerDto } from "dtos/jobAssignment.dto";
import { IJobAssignmentDocument } from "types/jobAssignment.type";
import { IUserDocument } from "types/user.type";

export class AssignmentMapper {
    static mapFreelancer(f: IUserDocument): FreelancerProfileDto {
        return {
            id: f._id.toString(),
            username: f.username,
            name: f.name ?? '',
            email: f.email,
            profileImage: f.profileImage ?? '',
            phone: f.phone ?? '',
        } as FreelancerProfileDto;
    }

    static mapAssignment(a: any): AssignmentDto {
        return {
            id: a._id.toString(),
            amount: a.amount,
            tasks: a.tasks ?? [],
            status: a.status,
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString(),
            milestones: a.milestones,
            freelancer: this.mapFreelancer(a.freelancerId),
        };
    }

    static mapList(assignments: any[]): AssignmentDto[] {
        return assignments.map(a => this.mapAssignment(a));
    }
}