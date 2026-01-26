import { endPoints } from "../config/endpoints";
import axios from "../lib/axios";
import type { IProposal, IProposalForm } from "../types/job/proposal.type";
import type { IRazoryOrderResponse } from "../types/razorpay.types";

class ProposalService {

  createProposal(data: IProposalForm) {
    return axios.post(endPoints.PROPOSAL.CREATE, data);
  }

  getProposalsForJob(jobId: string, status: string, invitation: boolean, page: number, limit: number) {
    return axios.get(endPoints.PROPOSAL.FOR_JOB(jobId, status, invitation, page, limit));
  }

  getProposal(proposalId: string) {
    return axios.get(endPoints.PROPOSAL.BY_ID(proposalId));
  }

  updateProposal(proposalId: string, data: Partial<IProposal>) {
    return axios.put(endPoints.PROPOSAL.UPDATE(proposalId), data);
  }

  updateProposalStatus(proposalId: string, status: string) {
    return axios.patch(endPoints.PROPOSAL.UPDATE_STATUS(proposalId), { status });
  }

  acceptProposal(proposalId: string) {
    return axios.post(endPoints.PROPOSAL.ACCEPT_PROPOSAL(proposalId));
  }

  cancelProposal(proposalId: string) {
    return axios.patch(endPoints.PROPOSAL.CANCEL_PROPOSAL(proposalId));
  }

  inviteFreelancer(jobId: string, freelancerId: string, invitationData: Record<string, string>) {
    return axios.post(endPoints.PROPOSAL.INVITE(jobId, freelancerId), invitationData);
  }

  acceptInvitation(jobId: string, freelancerId: string) {
    return axios.patch(endPoints.PROPOSAL.ACCEPT_INVITE(jobId, freelancerId));
  }

  myProposals(isInvitation: boolean, search: string, cursor: string, limit: number,) {
    return axios.get(endPoints.PROPOSAL.MY_PROPOSAL(isInvitation, search, cursor, limit));
  }

  proposalsForClient(isInvitation: boolean, search: string, cursor: string | undefined, limit: number) {
    return axios.get(endPoints.PROPOSAL.CLIENT_PROPOSAL(isInvitation, search, cursor, limit));
  }

  verifyUpgrade(payload: IRazoryOrderResponse & { paymentRecordId: string }) {
    return axios.post(endPoints.PROPOSAL.VERIFY, payload);
  }

  withdrawInvitation(proposalId: string) {
    return axios.patch(endPoints.PROPOSAL.WITHDRAW_INVITATION(proposalId));
  }
}

export const proposalService = new ProposalService();