import { RevenueGraphPointDTO } from "../../dtos/adminDashboard.dto";
import { IRevenueDocument } from "../../types/revenue.type";
import { IBaseRepository } from "./IBaseRepository";

export interface IRevenueRepository extends IBaseRepository<IRevenueDocument>{
    getTotalRevenue(): Promise<number>;
    getRevenueSummaryByType(): Promise<{ commission: number; subscription: number; addOn: number }>;
    getRevenueThisMonth(): Promise<number>;
    getRevenueGraph(monthsBack?: number): Promise<RevenueGraphPointDTO[]>;
};