import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { IMatchService } from "./interface/IMatchService";
import { IUserRepository } from "repositories/interfaces/IUserRepository";
import { ISubscriptionService } from "./interface/ISubscriptionService";
import { JobMapper } from "mappers/job.mapper";
import { JobListDTO } from "dtos/job.dto";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import { MatchCacheService } from "utils/bestMatchCache.util";
import { MatchScoreHelper } from "helpers/matchScore.helper";
import { FreelancerListItemDto } from "dtos/freelancerProfile.dto";

export class MatchService implements IMatchService {
    constructor(
        private _jobRepository: IJobRepository,
        private _userRepository: IUserRepository,
        private _subscriptionService: ISubscriptionService,
    ){};

    async getBestMatchJobs(freelancerId: string): Promise<JobListDTO[] | null> {

        const plan = await this._subscriptionService.getActiveFeatures(freelancerId);

        if(!plan) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.SUBSCRIPTION_NOT_FOUND);

        if (!plan?.features?.BestMatch) {
            const jobs = await this._jobRepository.findWithSkills({ status: "open", visibility: "public", isDeleted: false });

            jobs.map((job) => JobMapper.toListDTO(job));
        }

        const freelancer = await this._userRepository.findById(freelancerId);
        if (!freelancer) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }

        const jobs = await this._jobRepository.findWithSkills({
            status: "open",
            visibility: "public",
            isDeleted: false,
        });

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

        return ranked
            .filter(j => j.matchScore >= 60)
            .sort((a, b) => b.matchScore - a.matchScore);
    }
    
    async getBestMatchFreelancers(jobId: string): Promise<FreelancerListItemDto[]> {
        const job = await this._jobRepository.findById(jobId);
        if (!job) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);

        const freelancers = await this._userRepository.findWithSkill({
            role: "freelancer",
            status: "active",
        });

        const ranked = freelancers.map(user => ({
            ...user.toObject(),
            matchScore: MatchScoreHelper.computeFreelancerForJob(job, user),
        }));

        return ranked
            .filter(f => f.matchScore >= 60)
            .sort((a, b) => b.matchScore - a.matchScore);
    }
}