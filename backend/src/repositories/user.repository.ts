import { BaseRepository } from "./base.repository";
import { IUserDocument } from "../types/user.type";
import userModel from "./../models/user.model"
import { IUserRepository } from "./interfaces/IUserRepository";
import { ClientSession, FilterQuery, ObjectId } from "mongoose";
import { RecentUserDTO, UserGrowthGraphPointDTO } from "../dtos/adminDashboard.dto";
import { startOfMonth, subMonths } from "date-fns";

export class UserRepository 
   extends BaseRepository<IUserDocument>
      implements IUserRepository {
        
    constructor(){
        super(userModel);
    }

    async findByEmail(email : string) : Promise<IUserDocument | null>{
        return this.model.findOne({ email });
    }

    async findStatusById(id: ObjectId | string): Promise<IUserDocument> {
        return this.model.findById(id).select("status");
    }

    async findWithSkill(filter: FilterQuery<IUserDocument>) : Promise<IUserDocument[]>{
        return this.model.find(filter)
        .populate("skills", "name _id");
    }

    async findClients() : Promise<IUserDocument[]>{
        return this.model.find({ role : "client" });
    }

    async findByLocation(city ?: string, country ?: string, state ?: string) : Promise<IUserDocument[]>{

        const filter : Record<string, string> = {};
        
        if(city) filter["location.city"] = city;
        if(country) filter["location.country"] = country;
        if(state) filter["location.state"] = state;

        return this.model.find(filter)
    }

    async findByIdWithSkills(userId: string) : Promise<IUserDocument | null> {
        return this.model.findById(userId).populate("skills", "name _id");
    }

    async findWithSkillsPaginated(
        filter: FilterQuery<IUserDocument>,
        limit: number,
    ): Promise<IUserDocument[]> {
    const paginatedFilter: FilterQuery<IUserDocument> = { ...filter };

    return this.model
        .find(paginatedFilter)
        .sort({ _id: -1 })
        .limit(limit)
        .populate("skills", "name _id")
        .exec();
    }

    async resetSubscriptionState(
        userId: string,
        limits: { invitesRemaining: number; proposalsRemaining: number },
        session: ClientSession
    ): Promise<void> {
        await this.model.updateOne(
            { _id: userId },
            {
                $set: {
                    limits,
                    isVerified: false,
                    subscription: null,
                },
            },
            { session }
        );
    }

    async searchForSelect(
        filter: FilterQuery<IUserDocument>,
        page: number,
        limit: number
    ): Promise<Pick<IUserDocument, "_id" | "username" | "email">[]> {
        return this.model.find(filter)
            .select("username email")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
    }

    async findByIds(userIds: string[]): Promise<Pick<IUserDocument, "_id" | "username" | "email">[]> {
        return this.model.find(
            { _id: { $in: userIds } },
            { username: 1, email: 1 }
        ).lean();
    }
    
    async countByRole(role: "client" | "freelancer"): Promise<number> {
        return this.model.countDocuments({ role, status: { $ne: "banned" } });
    }

    async countNewThisMonth(): Promise<number> {
        const start = startOfMonth(new Date());
        return this.model.countDocuments({ createdAt: { $gte: start } });
    }

    async getUserGrowthGraph(monthsBack = 6): Promise<UserGrowthGraphPointDTO[]> {
        const since = subMonths(startOfMonth(new Date()), monthsBack - 1);

        const raw = await this.model.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        role: "$role",
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        const pivotMap = new Map<string, UserGrowthGraphPointDTO>();

        raw.forEach(({ _id, count }) => {
            const key = `${_id.year}-${_id.month}`;
            if (!pivotMap.has(key)) {
                pivotMap.set(key, {
                    year: _id.year,
                    month: _id.month,
                    clients: 0,
                    freelancers: 0,
                    total: 0,
                });
            }
            const entry = pivotMap.get(key)!;
            if (_id.role === "client") entry.clients += count;
            if (_id.role === "freelancer") entry.freelancers += count;
            entry.total += count;
        });

        return Array.from(pivotMap.values());
    }

    async getRecentUsers(limit = 8): Promise<IUserDocument[]> {
        const users = await this.model
            .find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("username email role status isVerified createdAt");

        return users;
    }
}