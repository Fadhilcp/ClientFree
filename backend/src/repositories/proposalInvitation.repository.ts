import { BaseRepository } from "./base.repository";
import { IProposalInvitationDocument } from "types/proposalInvitation.type";
import { IProposalInvitationRepository } from "./interfaces/IProposalInvitation";
import proposalInvitationModel from "models/proposalInvitation.model";

export class ProposalInvitationRepository 
   extends BaseRepository<IProposalInvitationDocument>
      implements IProposalInvitationRepository {
        
    constructor(){
        super(proposalInvitationModel);
    }
}