import { IJobRepository } from "../repositories/interfaces/IJobRepository";
import { IMatchService } from "./interface/IMatchService";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { ISubscriptionService } from "./interface/ISubscriptionService";
import { JobMapper } from "../mappers/job.mapper";
import { JobListDTO } from "../dtos/job.dto";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import { MatchCacheService } from "../utils/bestMatchCache.util";
import { MatchScoreHelper } from "../helpers/matchScore.helper";
import { FreelancerListItemDto } from "../dtos/freelancerProfile.dto";
import { FilterQuery } from "mongoose";
import { IJobDocument } from "../types/job.type";
import { IUserDocument } from "../types/user.type";
import { mapUserToFreelancerListItemDto } from "../mappers/freelancer.mapper";
import { UserRole } from "constants/user.constants";

export class MatchService implements IMatchService {
    constructor(
        private _jobRepository: IJobRepository,
        private _userRepository: IUserRepository,
        private _subscriptionService: ISubscriptionService,
    ){};

    async getBestMatchJobs(
        freelancerId: string,
        limit: number,
        cursor?: string,
        search?: string,
        filters?: {
            category?: string;
            location?: string;
            budgetMin?: number;
            budgetMax?: number;
        }
    ): Promise<{ jobs: JobListDTO[], nextCursor: string | null }> {

        const plan = await this._subscriptionService.getActiveFeatures(freelancerId);

        if(!plan) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.SUBSCRIPTION_NOT_FOUND);

        if (!plan?.features?.BestMatch) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Your subscription does not include the Best Match feature.")
        }

        const freelancer = await this._userRepository.findById(freelancerId);
        if (!freelancer) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }

        let filter: FilterQuery<IJobDocument> = {
            status: "open",
            visibility: "public",
            isDeleted: false,
        };

        if(cursor) filter._id = { $lt: cursor };

        if(search && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
            { title: regex },
            { category: regex },
            { subcategory: regex }
            ];
        }

        if(filters?.category) filter.category = filters.category;
        if(filters?.budgetMin !== undefined || filters?.budgetMax !== undefined) {
            filter["payment.budget"] = {};
            if(filters.budgetMin !== undefined) filter["payment.budget"].$gte = filters.budgetMin;
            if(filters.budgetMax !== undefined) filter["payment.budget"].$lte = filters.budgetMax;
        }
        if(filters?.location?.trim()) {
            const loc = filters.location.trim();
            filter.$or = [
                ...(filter.$or ?? []),
                { "locationPreference.city": { $regex: loc, $options: "i" } },
                { "locationPreference.country": { $regex: loc, $options: "i" } }
            ];
        }

        const jobs = await this._jobRepository.findWithSkillsPaginated(filter, limit * 3);

        const ranked = await Promise.all(
            jobs.map(async job => {
                const cached = await MatchCacheService.get(job._id.toString(), freelancerId);

                const score =
                    cached?.score ??
                    MatchScoreHelper.computeJobForFreelancer(freelancer, job);

                if (!cached) {
                    await MatchCacheService.set(
                        job._id.toString(),
                        freelancerId,
                        score
                    );
                }

                return {
                    ...job.toObject(),
                    matchScore: score,
                };
            })
        );

        const filtered = ranked.filter(j => j.matchScore >= 60)
                                .sort((a,b) => b.matchScore - a.matchScore);

        const paginated = filtered.slice(0, limit);
        const nextCursor = paginated.length > 0 ? paginated[paginated.length - 1]._id.toString() : null;

        return {
            jobs: paginated.map(job => JobMapper.toListDTO(job)),
            nextCursor
        };
    }
    
    async getBestMatchFreelancers(
        jobId: string,
        limit: number,
        cursor?: string,
        search?: string,
        filters?: {
            location?: string;
            experience?: string;
            hourlyRateMin?: number;
            hourlyRateMax?: number;
            ratingMin?: number;
        }
    ): Promise<{ freelancers: FreelancerListItemDto[], nextCursor: string | null }> {
        const job = await this._jobRepository.findById(jobId);
        if (!job) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);

        const filter: FilterQuery<IUserDocument> = { role: UserRole.FREELANCER, isProfileCompleted: true, status: "active" };

        // search
        if(search?.trim()){
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { username: regex },
                { name: regex },
                { professionalTitle: regex }
            ];
        }

        // location filter
        if (filters?.location?.trim()) {
            const loc = filters.location.trim();
            filter.$or = [
                ...(filter.$or ?? []),
                { "location.city": { $regex: loc, $options: "i" } },
                { "location.state": { $regex: loc, $options: "i" } },
                { "location.country": { $regex: loc, $options: "i" } },
            ];
        }

        // experience
        if (filters?.experience) filter.experienceLevel = filters.experience;

        // hourly rate
        if (filters?.hourlyRateMin !== undefined || filters?.hourlyRateMax !== undefined) {
            filter.hourlyRate = {};
            if(filters.hourlyRateMin !== undefined) filter.hourlyRate.$gte = filters.hourlyRateMin;
            if(filters.hourlyRateMax !== undefined) filter.hourlyRate.$lte = filters.hourlyRateMax;
        }

        // rating
        if (filters?.ratingMin !== undefined) {
            filter["ratings.asFreelancer"] = { $gte: filters.ratingMin };
        }

        // cursor for infinite scroll
        if(cursor && cursor !== "undefined" && cursor !== "null") {
            filter._id = { $lt: cursor };
        }

        // fetch candidates
        const freelancers = await this._userRepository.findWithSkillsPaginated(filter, limit * 3);

        const ranked = freelancers.map(user => ({
            ...user.toObject(),
            matchScore: MatchScoreHelper.computeFreelancerForJob(job, user),
        }));

        const filtered = ranked.filter(f => f.matchScore >= 60).sort((a,b) => b.matchScore - a.matchScore);

        // paginate using limit & cursor
        const paginated = filtered.slice(0, limit);
        const nextCursor = paginated.length > 0 ? paginated[paginated.length - 1]._id.toString() : null;

        return {
            freelancers: paginated.map(mapUserToFreelancerListItemDto),
            nextCursor
        };
    }
}