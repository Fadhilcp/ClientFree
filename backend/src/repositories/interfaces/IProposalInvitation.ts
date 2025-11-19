import { IBaseRepository } from "./IBaseRepository";
import { IProposalInvitationDocument } from "types/proposalInvitation.type";

// export interface IProposalInvitationRepository extends IBaseRepository<IProposalInvitationDocument>{};

export type IProposalInvitationRepository = IBaseRepository<IProposalInvitationDocument>;