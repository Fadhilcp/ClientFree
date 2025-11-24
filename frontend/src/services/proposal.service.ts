import { endPoints } from "../config/endpoints";
import axios from "../lib/axios";
import type { IProposal } from "../types/job/proposal.type";

class ProposalService {

  createProposal(data: IProposal) {
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
}

export const proposalService = new ProposalService();