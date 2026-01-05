import { FilterQuery } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";
import { IProposalInvitationDocument } from "../../types/proposalInvitation.type";

export interface IProposalRepository extends IBaseRepository<IProposalInvitationDocument>{
    findWithDetail(filter: FilterQuery<IProposalInvitationDocument>): Promise<IProposalInvitationDocument[]>;
    findByJob(fitler: FilterQuery<IProposalInvitationDocument>,
        page: number, limit: number
    ): Promise<{ proposals: IProposalInvitationDocument[], total: number, totalPages: number }>;
    findWithDetailPaginated(
        filter: FilterQuery<IProposalInvitationDocument>,
        limit: number,
    ): Promise<IProposalInvitationDocument[]>;
};