import { BaseRepository } from "./base.repository";
import { IProposalInvitationDocument } from "../types/proposalInvitation.type";
import { IProposalRepository } from "./interfaces/IProposalInvitation";
import proposalInvitationModel from "../models/proposalInvitation.model";
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

    async findByJob(filter: FilterQuery<IProposalInvitationDocument>,
        page: number, limit: number
    ): Promise<{ proposals: IProposalInvitationDocument[], total: number, totalPages: number }> {

        const mongoFilter = {
            ...filter,
            jobId: new Types.ObjectId(filter.jobId as string),
        };

        const skip = (page - 1) * limit;

        const result = await this.model.aggregate<{ data: IProposalInvitationDocument[], totalCount: { count:number }[]; }>([
            { $match: mongoFilter },
            {
                $addFields: {
                    isSponsored: {
                    $eq: ["$optionalUpgrade.name", "sponsored"]
                    }
                }
            },
            { $sort: { isSponsored: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                            from: "users",
                            localField: "freelancerId",
                            foreignField: "_id",
                            as: "freelancerId",
                            },
                        },
                        { $unwind: "$freelancerId" },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            },
        ]);

        const data = result[0]?.data ?? [];
        const total = result[0]?.totalCount[0]?.count || 0;

        return { proposals: data, total, totalPages: Math.ceil(total / limit) }
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