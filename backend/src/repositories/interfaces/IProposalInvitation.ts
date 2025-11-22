import { Types } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";
import { IProposalInvitationDocument } from "types/proposalInvitation.type";

export interface IProposalRepository extends IBaseRepository<IProposalInvitationDocument>{
    findDetailById(id: string | Types.ObjectId): Promise<IProposalInvitationDocument | null>;
    findByJob(jobId: string): Promise<IProposalInvitationDocument[]>;
};