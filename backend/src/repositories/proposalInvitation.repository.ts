import { BaseRepository } from "./base.repository";
import { IProposalInvitationDocument } from "types/proposalInvitation.type";
import { IProposalRepository } from "./interfaces/IProposalInvitation";
import proposalInvitationModel from "models/proposalInvitation.model";
import { FilterQuery, Types, UpdateQuery } from "mongoose";

export class ProposalRepository 
   extends BaseRepository<IProposalInvitationDocument>
      implements IProposalRepository {
        
    constructor(){
        super(proposalInvitationModel);
    }
    async findDetailById(id: string | Types.ObjectId): Promise<IProposalInvitationDocument | null> {
        return this.model.findById(id)
            .populate("freelancerId", "firstName lastName skills rating")
            .populate("jobId", "title category subcategory payment clientId");
    }

    async findByJob(filter: FilterQuery<IProposalInvitationDocument> | Types.ObjectId): Promise<IProposalInvitationDocument[]> {
        return this.model.find(filter)
            .populate("freelancerId", "username email profileImage")
    }
}