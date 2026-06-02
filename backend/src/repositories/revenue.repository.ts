import { IRevenueDocument } from "../types/revenue.type";
import { BaseRepository } from "./base.repository";
import { IRevenueRepository } from "./interfaces/IRevenueRepository";
import revenueModel from "../models/revenue.model";
import { startOfMonth, subMonths } from "date-fns";
import { RevenueGraphPointDTO } from "../dtos/adminDashboard.dto";


export class RevenueRepository 
   extends BaseRepository<IRevenueDocument>
      implements  IRevenueRepository {
        
    constructor(){
        super(revenueModel);
    }


    async getTotalRevenue(): Promise<number> {
        const result = await this.model.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        return result[0]?.total ?? 0;
    }

    async getRevenueSummaryByType(): Promise<{
        commission: number;
        subscription: number;
        addOn: number;
    }> {
        const result = await this.model.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const map: Record<string, number> = {};
        result.forEach((r) => (map[r._id] = r.total));

        return {
            commission: map["commission"] ?? 0,
            subscription: map["subscription"] ?? 0,
            addOn: map["addOn"] ?? 0,
        };
    }

    async getRevenueThisMonth(): Promise<number> {
        const start  = startOfMonth(new Date());
        const result = await this.model.aggregate([
            { $match: { status: "completed", createdAt: { $gte: start } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        return result[0]?.total ?? 0;
    }

    async getRevenueGraph(monthsBack = 6): Promise<RevenueGraphPointDTO[]> {
        const since = subMonths(startOfMonth(new Date()), monthsBack - 1);

        const raw = await this.model.aggregate([
            { $match: { status: "completed", createdAt: { $gte: since } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        type: "$type",
                    },
                    total: { $sum: "$amount" },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        const pivotMap = new Map<string, RevenueGraphPointDTO>();

        raw.forEach(({ _id, total }) => {
            const key = `${_id.year}-${_id.month}`;
            if (!pivotMap.has(key)) {
                pivotMap.set(key, {
                    year: _id.year,
                    month: _id.month,
                    commission: 0,
                    subscription: 0,
                    addOn: 0,
                    total: 0,
                });
            }
            const entry = pivotMap.get(key)!;
            entry[_id.type as "commission" | "subscription" | "addOn"] += total;
            entry.total += total;
        });

        return Array.from(pivotMap.values());
    }
}