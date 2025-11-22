import { ProposalDTO } from "dtos/proposal.dto";
import { IProposalInvitationDocument } from "../../types/proposalInvitation.type";
import { IProposalInvitation, ProposalStatus } from "../../types/proposalInvitation.type";

export interface IProposalService {
    createProposal(
        jobId: string,freelancerId: string,payload: IProposalInvitation
    ): Promise<ProposalDTO>;
    getProposalsForJob(jobId: string): Promise<ProposalDTO[]>;
    getById(id: string): Promise<ProposalDTO>;
    updateProposal(id: string,data: IProposalInvitation): Promise<ProposalDTO>;
    updateStatus(id: string,status: ProposalStatus): Promise<ProposalDTO>;
}