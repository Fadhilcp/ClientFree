import { ProposalDTO } from "../../dtos/proposal.dto";
import { CreateProposalResponse, IInvitationDetails, IProposalInvitationPayload } from "../../types/proposalInvitation.type";
import { IProposalInvitation, ProposalStatus } from "../../types/proposalInvitation.type";
import { IRazoryPaymentResponse } from "../../types/razorpay.types";
import { Types } from "mongoose";
import { PaginatedResult } from "../../types/pagination";

export interface IProposalService {
    createProposal(
        jobId: string,freelancerId: string,payload: IProposalInvitationPayload
    ): Promise<CreateProposalResponse>;
    getProposalsForJob(jobId: string, status?: string, isInvitation?: boolean, page?: number, limit?: number): Promise<PaginatedResult<ProposalDTO>>;
    getById(proposalId: string): Promise<ProposalDTO>;
    updateProposal(proposalId: string, proposalData: IProposalInvitation): Promise<ProposalDTO>;
    updateStatus(proposalId: string,status: ProposalStatus): Promise<ProposalDTO>;
    acceptProposal(proposalId: string): Promise<void>;
    inviteFreelancer(
        jobId: string, clientId: string, freelancerId: string, invitation: IInvitationDetails
    ): Promise<ProposalDTO>;
    acceptInvitation(jobId: string, freelancerId: string): Promise<{ message: string }>;
    getMyProposals(
        freelancerId: string, isInvitation: boolean, search: string, limit: number, cursor?: string
    ): Promise<{ proposals: ProposalDTO[], nextCursor: string | null }>;

    getProposalsForClient(
        clientId: string, isInvitation: boolean, search: string, limit: number, cursor?: string
    ): Promise<{ proposals: ProposalDTO[], nextCursor: string | null }>;

    verifyUpgradePayment({
        paymentRecordId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    }: IRazoryPaymentResponse): Promise<boolean>;
    cancelProposal(proposalId: string, freelancerId: string): Promise<ProposalDTO>;

    aiShortlistTopProposals(jobId: string, topN: number)
    : Promise<{ shortlisted: number, proposalIds?: Types.ObjectId[] }>;

}