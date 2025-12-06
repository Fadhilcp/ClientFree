import { ProposalDTO } from "dtos/proposal.dto";
import { IInvitationDetails, IProposalInvitationDocument } from "../../types/proposalInvitation.type";
import { IProposalInvitation, ProposalStatus } from "../../types/proposalInvitation.type";

export interface IProposalService {
    createProposal(
        jobId: string,freelancerId: string,payload: IProposalInvitation
    ): Promise<ProposalDTO>;
    getProposalsForJob(jobId: string, status?: string, isInvitation?: boolean): Promise<ProposalDTO[]>;
    getById(proposalId: string): Promise<ProposalDTO>;
    updateProposal(proposalId: string, proposalData: IProposalInvitation): Promise<ProposalDTO>;
    updateStatus(proposalId: string,status: ProposalStatus): Promise<ProposalDTO>;
    acceptProposal(proposalId: string): Promise<void>;
    inviteFreelancer(
        jobId: string, clientId: string, freelancerId: string, invitation: IInvitationDetails
    ): Promise<ProposalDTO>;
    acceptInvitation(jobId: string, freelancerId: string): Promise<{ message: string }>;
    getMyProposals(freelancerId: string, isInvitation: boolean): Promise<ProposalDTO[]>;
    getProposalsForClient(clientId: string, isInvitation: boolean): Promise<ProposalDTO[]>;
}