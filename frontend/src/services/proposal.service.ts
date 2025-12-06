import { endPoints } from "../config/endpoints";
import axios from "../lib/axios";
import type { IProposal, IProposalForm } from "../types/job/proposal.type";

class ProposalService {

  createProposal(data: IProposalForm) {
    return axios.post(endPoints.PROPOSAL.CREATE, data);
  }

  getProposalsForJob(jobId: string, status: string, invitation: boolean) {
    return axios.get(endPoints.PROPOSAL.FOR_JOB(jobId, status, invitation));
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

  inviteFreelancer(jobId: string, freelancerId: string, invitationData: Record<string, string>) {
    return axios.post(endPoints.PROPOSAL.INVITE(jobId, freelancerId), invitationData);
  }

  acceptInvitation(jobId: string, freelancerId: string) {
    return axios.post(endPoints.PROPOSAL.ACCEPT_INVITE(jobId, freelancerId));
  }

  myProposals(isInvitation: boolean) {
    return axios.get(endPoints.PROPOSAL.MY_PROPOSAL(isInvitation));
  }

  proposalsForClient(isInvitation?: boolean) {
    return axios.get(endPoints.PROPOSAL.CLIENT_PROPOSAL(isInvitation));
  }
}

export const proposalService = new ProposalService();