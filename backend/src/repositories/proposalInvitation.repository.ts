import { BaseRepository } from "./base.repository";
import { IProposalInvitationDocument } from "types/proposalInvitation.type";
import { IProposalRepository } from "./interfaces/IProposalInvitation";
import proposalInvitationModel from "models/proposalInvitation.model";
import { FilterQuery, Types } from "mongoose";

export class ProposalRepository 
   extends BaseRepository<IProposalInvitationDocument>
      implements IProposalRepository {
        
    constructor(){
        super(proposalInvitationModel);
    }
    findWithDetail(filter: FilterQuery<IProposalInvitationDocument>): Promise<IProposalInvitationDocument[]> {
        return this.model.find(filter)
            .populate("freelancerId")
            .populate("jobId");
    }

    async findByJob(filter: FilterQuery<IProposalInvitationDocument> | Types.ObjectId): Promise<IProposalInvitationDocument[]> {
        return this.model.find(filter)
            .populate("freelancerId", "username email profileImage")
    }
}