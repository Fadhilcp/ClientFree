import { IJob, IJobDocument } from "types/job.type";
import { IProposalInvitation, IProposalInvitationDocument } from "types/proposalInvitation.type";

export interface IJobService {
    createJob(data: IJob): Promise<IJobDocument>;
    getAllJobs(): Promise<IJobDocument[]>;
    getJobById(jobId: string): Promise<IJobDocument | null>;
    updateJob(jobId: string, data: IJob): Promise<IJobDocument>;
    deleteJob(jobId: string): Promise<string>;
    addProposal(jobId: string, data: IProposalInvitation): Promise<IProposalInvitationDocument>;
}