import { ProposalDTO } from "dtos/proposal.dto";
import { CreateProposalResponse, IInvitationDetails, IProposalInvitationDocument } from "../../types/proposalInvitation.type";
import { IProposalInvitation, ProposalStatus } from "../../types/proposalInvitation.type";
import { IRazoryOrderResponse } from "types/razorpay.types";

export interface IProposalService {
    createProposal(
        jobId: string,freelancerId: string,payload: IProposalInvitation
    ): Promise<CreateProposalResponse>;
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
    verifyUpgradePayment({
        paymentRecordId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    }: IRazoryOrderResponse): Promise<boolean>;
}