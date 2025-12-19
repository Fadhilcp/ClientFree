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

    async findByJob(filter: FilterQuery<IProposalInvitationDocument>): Promise<IProposalInvitationDocument[]> {
        const mongoFilter = {
            ...filter,
            jobId: new Types.ObjectId(filter.jobId as string),
        };
        return this.model.aggregate([
            { $match: mongoFilter },
            {
                $addFields: {
                    isSponsored: {
                    $eq: ["$optionalUpgrade.name", "sponsored"]
                    }
                }
            },
            {
                $sort: {
                    isSponsored: -1
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "freelancerId",
                    foreignField: "_id",
                    as: "freelancerId"
                }
            },
            { $unwind: "$freelancerId" }
        ]);
    }


    async findWithDetailPaginated(
        filter: FilterQuery<IProposalInvitationDocument>,
        limit: number,
    ): Promise<IProposalInvitationDocument[]> {
    const paginatedFilter: FilterQuery<IProposalInvitationDocument> = { ...filter };

    return this.model
        .find(paginatedFilter)
        .populate("freelancerId")
        .populate("jobId")
        .sort({ _id: -1 })
        .limit(limit)
        .exec();
    }
}