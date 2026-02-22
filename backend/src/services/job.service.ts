import { IJobRepository } from "../repositories/interfaces/IJobRepository";
import { IJobService } from "./interface/IJobService";
import { IJob, IJobDocument, IJobStatus } from "../types/job.type";
import { createHttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { ClientSession, FilterQuery, Types } from "mongoose";
import { JobMapper } from "../mappers/job.mapper";
import { JobDetailDTO, JobListDTO } from "../dtos/job.dto";
import { HttpResponse } from "../constants/responseMessage.constant";
import { IProposalRepository } from "../repositories/interfaces/IProposalInvitation";
import { IJobAssignmentRepository } from "../repositories/interfaces/IJobAssignmentRepository";
import { IJobAssignmentDocument } from "../types/jobAssignment/jobAssignment.type";
import { AuthPayload } from "../types/auth.type";
import { createJobSchema } from "../schema/job.schema";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IClarificationBoardRepository } from "../repositories/interfaces/IClarificationBoardRepository";
import { IPaymentRepository } from "../repositories/interfaces/IPaymentRepository";
import { IWalletRepository } from "../repositories/interfaces/IWalletRepository";
import { IWalletTransactionRepository } from "../repositories/interfaces/IWalletTransactionRepository";
import { IDatabaseSessionProvider } from "../repositories/db/session-provider.interface";
import { IUserDocument } from "../types/user.type";
import { UserRole } from "../constants/user.constants";
import { INotificationService } from "./interface/INotificationService";
import { JobFilters, JobSort } from "../types/filter.type";
import { buildJobSort } from "../helpers/buildJobSort";

export class JobService implements IJobService {

    constructor(
        private _jobRepository: IJobRepository, 
        private _proposalRepository: IProposalRepository,
        private _jobAssignmentRepository: IJobAssignmentRepository,
        private _userRepository: IUserRepository,
        private _clarificationBoardRepository: IClarificationBoardRepository,
        private _paymentRepository: IPaymentRepository,
        private _walletRepository: IWalletRepository,
        private _walletTransactionRepository: IWalletTransactionRepository,
        private _sessionProvider: IDatabaseSessionProvider,
        private _notificationService: INotificationService
    ){}

    async createJob(jobData: IJob): Promise<JobDetailDTO> {
        const parsed = createJobSchema.safeParse(jobData);
        if(!parsed.success){
            const errors = parsed.error.format();
            throw createHttpError(HttpStatus.BAD_REQUEST,`Job validation failed: ${JSON.stringify(errors)}`);
        }
        
        const result = await this._jobRepository.create(jobData);

        const clarificationBoardExists = await this._clarificationBoardRepository.findOne({ jobId: result._id });
        if(clarificationBoardExists) {
            throw createHttpError(HttpStatus.CONFLICT, "Clarification board already exists");
        }
        //clarification board auto-created when creating job
        await this._clarificationBoardRepository.create({ jobId: result._id })
        // Auto notification
        await this._notificationService.createNotification({
            scope: "role",
            roles: [UserRole.FREELANCER],
            category: "job_posted",
            subject: "New job posted",
            message: `A new job "${result.title}" has been posted. Check it out and place your bid.`,
            sendAs: "in-app",
            createdBy: result.clientId, // createdby job owner
        });

        return JobMapper.toDetailDTO(result)
    }

    async getAllJobs(
        freelancerId: string, status: string, search: string, limit: number, cursor?: string,
        filters?: JobFilters,
        sort: JobSort = "newest"
    ): Promise<{ jobs: JobListDTO[], nextCursor: string | null }> {
        let interestedJobIds: string[] = [];

        if(freelancerId) {
            const user = await this._userRepository.findById(freelancerId);
            if(user && user.role === UserRole.FREELANCER) {
                interestedJobIds = user.interests
                ?.filter(i => i.type === "freelancerJob" && i.jobId)
                .map(i => i.jobId!.toString()) ?? [];
            }
        }
        const filter: FilterQuery<IJobDocument> = { 
            status: "open",
            visibility: "public",
            isDeleted: false,
            $or: [
                { isMultiFreelancer: true },
                { acceptedProposalIds: { $size: 0 } }
            ]
        };
        // buget based sort
        const sortQuery = buildJobSort(sort);
        
        if(status) filter.status = status;
        // cursor for infinite scroll
        if(cursor && cursor !== "undefined" && cursor !== "null") {
            filter._id = { $lt: cursor };
        }
        // search
        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");

            filter.$or = [
                { title: regex },
                { category: regex },
                { subcategory: regex }
            ];
        }

        // filter category
        if (filters?.category) {
            filter.category = filters.category;
        }
        // filter budget
        if (filters?.budgetMin !== undefined || filters?.budgetMax !== undefined) {
            filter["payment.budget"] = {};
            if (filters.budgetMin !== undefined) filter["payment.budget"].$gte = filters.budgetMin;
            if (filters.budgetMax !== undefined) filter["payment.budget"].$lte = filters.budgetMax;
        }
        // filter location
        if (filters?.location?.trim()) {
            const loc = filters.location.trim();
            filter.$or = [
                ...(filter.$or ?? []),
                { "locationPreference.city": { $regex: loc, $options: "i" } },
                { "locationPreference.country": { $regex: loc, $options: "i" } },
            ];
        }
        // workmode
        if (filters?.workMode) {
            filter["payment.type"] = filters.workMode;
        }

        // Skills
        if (filters?.skills && filters.skills.length > 0) {
            filter.skills = { $all: filters.skills.map(id => new Types.ObjectId(id)) };
        }

        const jobs = await this._jobRepository.findWithSkillsPaginated(filter, limit, sortQuery);
        //setting cursor for infinite scroll
        const nextCursor = jobs.length > 0 
        ? jobs[jobs.length - 1]._id.toString()
        : null;

        return {
            jobs: jobs.map(job => ({
                ...JobMapper.toListDTO(job),
                isInterested: interestedJobIds.includes(job.id)
            })),
            nextCursor
        };
    }

    async getJobById(jobId: string, user: AuthPayload): Promise<JobDetailDTO> {
        if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');

        const job = await this._jobRepository.findByIdWithDetails(jobId);
        
        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');
        // to prevent job detail from other clients
        if(user.role === UserRole.CLIENT){
            // because of populate client user
            const clientId =
                typeof job.clientId === "string" || job.clientId instanceof Types.ObjectId
                    ? job.clientId.toString()
                    : (job.clientId as IUserDocument)._id.toString();

            if(clientId.toString() !== user._id.toString()){
                throw createHttpError(HttpStatus.FORBIDDEN, 'You cannot view jobs posted by other clients.');
            }
        }
        return JobMapper.toDetailDTO(job);
    }

    async updateJob(jobId: string, jobData: IJob): Promise<JobDetailDTO> {
       if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');
       
       const updated = await this._jobRepository.findByIdAndUpdate(jobId,jobData);

       if(!updated) throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');

       return JobMapper.toDetailDTO(updated);
    }

    async deleteJob(jobId: string): Promise<string> {
        if(!jobId) throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is needed');

        const result = await this._jobRepository.updateOne({ _id: jobId }, { isDeleted: true });

        if(!result) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);

        return 'Job is deleted'
    }

    async getClientJobs(
        clientId: string, status: string, search: string, limit: number, cursor?: string,
        filters?: JobFilters,
        sort: JobSort = "newest"
    ): Promise<{ jobs: JobDetailDTO[], nextCursor: string | null }> {
        const filter: FilterQuery<IJobDocument> = { clientId, isDeleted: false };
        
        if(status){
            filter.status = status;
        }
        // cursor for infinite scroll
        if(cursor && cursor !== "undefined" && cursor !== "null") {
            filter._id = { $lt: cursor };
        }

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");

            filter.$or = [
                { title: regex },
                { category: regex },
                { subcategory: regex },
            ];
        }
        // category filter
        if (filters?.category) {
            filter.category = filters.category;
        }
        // budget filter
        if (filters?.budgetMin !== undefined || filters?.budgetMax !== undefined) {
            filter["payment.budget"] = {};

            if (filters.budgetMin !== undefined) {
                filter["payment.budget"].$gte = filters.budgetMin;
            }

            if (filters.budgetMax !== undefined) {
                filter["payment.budget"].$lte = filters.budgetMax;
            }
        }
        // workmode
        if (filters?.workMode) {
            filter["payment.type"] = filters.workMode;
        }
        // location filter (city or country)
        if (filters?.location?.trim()) {
            const loc = filters.location.trim();

            filter.$or = [
                ...(filter.$or ?? []),
                { "locationPreference.city": { $regex: loc, $options: "i" } },
                { "locationPreference.country": { $regex: loc, $options: "i" } },
            ];
        }

        if (filters?.skills && filters.skills.length > 0) {
            filter.skills = { $all: filters.skills.map(id => new Types.ObjectId(id)) };
        }
        // sort filter
        const sortQuery = buildJobSort(sort);

        const jobs = await this._jobRepository.findWithSkillsPaginated(filter, limit, sortQuery);

        //setting cursor for infinite scroll
        const nextCursor = jobs.length > 0 
        ? jobs[jobs.length - 1]._id.toString()
        : null;
        
        return {
            jobs: jobs.map(job => JobMapper.toDetailDTO(job)),
            nextCursor
        }
    }
    
    async changeStatus(jobId: string, clientId: string, status: IJobStatus): Promise<void> {
        const allowed = ["open","active","completed","cancelled"];

        if(!allowed.includes(status)){
            throw createHttpError(HttpStatus.BAD_REQUEST,HttpResponse.INVALID_STATUS);
        }
        const job = await this._jobRepository.findById(jobId);
        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);
        
        if(job.clientId.toString() !== clientId){
            throw createHttpError(HttpStatus.FORBIDDEN, "Not allowed");
        }
        await this._jobRepository.findByIdAndUpdate(jobId, { status });
    }

    async startJob(jobId: string, clientId: string): Promise<JobDetailDTO> {
        const job = await this._jobRepository.findById(jobId);

        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);
        if(job.clientId.toString() !== clientId) {
            throw createHttpError(HttpStatus.FORBIDDEN, "Not allowed");
        }
        if(job.status !== "open"){
            throw createHttpError(HttpStatus.CONFLICT, "Job must be in open state to activate");
        }
        if(job.acceptedProposalIds.length === 0){
            throw createHttpError(HttpStatus.CONFLICT,"No accepted proposal exists for this job");
        }
        // to reject all other proposals
        await this._proposalRepository.updateMany(
            {
                jobId: job._id,
                _id: { $nin: job.acceptedProposalIds }
            },
            { $set: { status: 'rejected'}}
        );
        const proposals = await this._proposalRepository.find({
            _id: { $in: job.acceptedProposalIds }
        });

        if(!proposals || proposals.length === 0){
            throw createHttpError(HttpStatus.NOT_FOUND, "Accepted proposals not found");
        }
        
        const totalAmount = proposals.reduce(
            (acc,proposal) => acc + (proposal.bidAmount || 0),
            0
        );
        await this._jobAssignmentRepository.updateMany(
            { proposalId: { $in: job.acceptedProposalIds }},
            { status: "active" }
        );
        
        const updatedJob = await this._jobRepository.findByIdAndUpdate(jobId, {
            $set: {
                status: "active",
                "payment.budget": totalAmount
            }
        } as FilterQuery<IJobDocument> );

        if(!updatedJob) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);
        
        return JobMapper.toDetailDTO(updatedJob);
    }

    async getFreelancerJobs(
        freelancerId: string, status: string, search: string, limit: number, cursor?: string,
        filters?: JobFilters,
        sort: JobSort = "newest",
    ): Promise<{ jobs: JobListDTO[], nextCursor: string | null }> {
        const assignmentFilter: FilterQuery<IJobAssignmentDocument> = { freelancerId: new Types.ObjectId(freelancerId) };

        if(status){
            assignmentFilter.status = status
        }
        // cursor for infinite scroll
        if(cursor && cursor !== "undefined" && cursor !== "null") {
            assignmentFilter._id = { $lt: cursor };
        }

        const jobFilter: FilterQuery<IJobDocument> = { "job.isDeleted": false };
        // search
        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");

            jobFilter.$or = [
                { "job.title": regex },
                { "job.category": regex },
                { "job.subcategory": regex },
            ];
        }

        // category
        if (filters?.category) {
            jobFilter["job.category"] = filters.category;
        }
        // budget
        if (filters?.budgetMin !== undefined || filters?.budgetMax !== undefined) {
            jobFilter["job.payment.budget"] = {};

            if (filters.budgetMin !== undefined) {
                jobFilter["job.payment.budget"].$gte = filters.budgetMin;
            }

            if (filters.budgetMax !== undefined) {
                jobFilter["job.payment.budget"].$lte = filters.budgetMax;
            }
        }
        // location
        if (filters?.location?.trim()) {
            const loc = filters.location.trim();

            jobFilter.$or = [
                ...(jobFilter.$or ?? []),
                { "job.locationPreference.city": { $regex: loc, $options: "i" } },
                { "job.locationPreference.country": { $regex: loc, $options: "i" } },
            ];
        }
        // work mode
        if (filters?.workMode) {
            jobFilter["job.payment.type"] = filters.workMode;
        }

        // Skills
        if (filters?.skills && filters.skills.length > 0) {
            jobFilter["job.skills"] = { $all: filters.skills.map(id => new Types.ObjectId(id)) };
        }

        // sort filter
        let sortQuery: Record<string, 1 | -1>;

        switch (sort) {
            case "budget_asc":
                sortQuery = { "job.payment.budget": 1, "_id": -1 };
                break;

            case "budget_desc":
                sortQuery = { "job.payment.budget": -1, "_id": -1 };
                break;

            case "newest":
            default:
                sortQuery = { "_id": -1 };
                break;
        }

        const assignments = await this._jobAssignmentRepository.findWithJobDetailPaginated(
            assignmentFilter, jobFilter, sortQuery, limit
        );

        if (!assignments || assignments.length === 0) {
            return { jobs: [], nextCursor: null };
        }
        
        const jobs = assignments.map(a => a.job as IJobDocument);
        //setting cursor for infinite scroll
        const nextCursor = jobs.length > 0 
        ? jobs[jobs.length - 1]._id.toString()
        : null;

        return {
            jobs: jobs.map(job => JobMapper.toListDTO(job)),
            nextCursor
        }
    }

    async getInterestedJobsForFreelancer(
        freelancerId: string, search: string, limit: number, cursor?: string, 
        filters?: JobFilters,
        sort: JobSort = "newest",
    ): Promise<{ jobs: JobListDTO[], nextCursor: string | null }> {

        const user = await this._userRepository.findById(freelancerId);
        if(!user) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

        const interestedJobIds = user.interests
        ?.filter(i => i.type === "freelancerJob" && i.jobId)
        .map(i => i.jobId?.toString());

        if(!interestedJobIds?.length) return { jobs: [], nextCursor: null };

        const filter: FilterQuery<IJobDocument> = { _id: { $in: interestedJobIds }, isDeleted: false }
        if(cursor && cursor !== "undefined" && cursor !== "null") {
            filter._id = { $in: interestedJobIds, $lt: cursor };
        }
         if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");

            filter.$or = [
                { title: regex },
                { category: regex },
                { subcategory: regex },
                { description: regex } 
            ];
        }
        // filter category
        if (filters?.category) {
            filter.category = filters.category;
        }
        // filter budget
        if (filters?.budgetMin !== undefined || filters?.budgetMax !== undefined) {
            filter["payment.budget"] = {};
            if (filters.budgetMin !== undefined) filter["payment.budget"].$gte = filters.budgetMin;
            if (filters.budgetMax !== undefined) filter["payment.budget"].$lte = filters.budgetMax;
        }
        // filter location
        if (filters?.location?.trim()) {
            const loc = filters.location.trim();
            filter.$or = [
                ...(filter.$or ?? []),
                { "locationPreference.city": { $regex: loc, $options: "i" } },
                { "locationPreference.country": { $regex: loc, $options: "i" } },
            ];
        }
        // workmode
        if (filters?.workMode) {
            filter["payment.type"] = filters.workMode;
        }
        if (filters?.skills && filters.skills.length > 0) {
            filter.skills = { $all: filters.skills.map(id => new Types.ObjectId(id)) };
        }
        // sort filter
        const sortQuery = buildJobSort(sort);

        const jobs = await this._jobRepository.findWithSkillsPaginated(
            filter,
            limit, 
            sortQuery
        );

        const nextCursor = jobs.length > 0 
        ? jobs[jobs.length - 1]._id.toString()
        : null;

        return {
            jobs: jobs.map(job => ({
                ...JobMapper.toListDTO(job),
                isInterested: interestedJobIds.includes(job.id)
            })),
            nextCursor
        }
    }

    async addJobInterest(freelancerId: string, jobId: string): Promise<void> {
        await this._userRepository.updateOne(
            { _id: freelancerId },
            {
                $addToSet: {
                    interests: {
                        type: "freelancerJob",
                        jobId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }
        );
    }

    async removeJobInterest(freelancerId: string, jobId: string): Promise<void> {
        await this._userRepository.updateOne(
            { _id: freelancerId },
            {
                $pull: {
                    interests: {
                        type: "freelancerJob",
                        jobId
                    }
                }
            }
        );
    }

    async cancelJob(jobId: string, user: AuthPayload): Promise<string> {
        if (!jobId) {
            throw createHttpError(HttpStatus.BAD_REQUEST, 'Job id is required');
        }
        // transaction session
        return this._sessionProvider.runInTransaction(async (session: ClientSession) => {

            const job = await this._jobRepository.findByIdWithSession(jobId, session);
            if (!job) {
                throw createHttpError(HttpStatus.NOT_FOUND, 'Job not found');
            }

            if (user.role !== UserRole.CLIENT || job.clientId.toString() !== user._id.toString()) {
                throw createHttpError(HttpStatus.FORBIDDEN, 'You are not allowed to cancel this job');
            }

            if (job.status !== 'open') {
                throw createHttpError(HttpStatus.BAD_REQUEST, 'Only open jobs can be cancelled');
            }

            const assignments = await this._jobAssignmentRepository.findWithSession(
                { jobId: job._id },
                session
            );

            for (const assignment of assignments) {
                // if milestones is empty
                if (!assignment.milestones || assignment.milestones.length === 0) {
                    assignment.status = 'cancelled';
                    await assignment.save({ session });
                    continue;
                }

            for (const milestone of assignment.milestones) {

                if (milestone.status === 'funded' && milestone.paymentId) {

                const payment = await this._paymentRepository.findByIdWithSession(
                    milestone.paymentId.toString(),
                    session
                );

                if (payment && payment.status === 'completed') {

                    const clientWallet = await this._walletRepository.findOneWithSession(
                        { userId: payment.clientId, role: UserRole.CLIENT, status: 'active' },
                        session
                    );

                    if (!clientWallet) {
                    throw createHttpError(HttpStatus.BAD_REQUEST, 'Client wallet not found');
                    }

                    clientWallet.balance.escrow -= payment.amount;
                    clientWallet.balance.available += payment.amount;
                    await clientWallet.save({ session });

                    await this._walletTransactionRepository.createWithSession({
                        walletId: clientWallet._id,
                        userId: clientWallet.userId,
                        paymentId: payment._id,
                        type: 'refund',
                        direction: 'credit',
                        amount: payment.amount,
                        balanceAfter: clientWallet.balance,
                    }, session);

                    payment.status = 'refund_processing';
                    payment.refundReason = 'Job cancelled before start';
                    payment.refundDate = new Date();
                    await payment.save({ session });

                    milestone.status = 'refunded';
                    milestone.updatedAt = new Date();
                }
              }
            }

            assignment.status = 'cancelled';
            await assignment.save({ session });
            }

            job.status = 'cancelled';
            await job.save({ session });

            return 'Job cancelled and escrow refunded successfully';
        });
    }

}