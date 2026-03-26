"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const mongoose_1 = require("mongoose");
const job_mapper_1 = require("../mappers/job.mapper");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const job_schema_1 = require("../schema/job.schema");
const user_constants_1 = require("../constants/user.constants");
const buildJobSort_1 = require("../helpers/buildJobSort");
class JobService {
    constructor(_jobRepository, _proposalRepository, _jobAssignmentRepository, _userRepository, _clarificationBoardRepository, _paymentRepository, _walletRepository, _walletTransactionRepository, _sessionProvider, _notificationService) {
        this._jobRepository = _jobRepository;
        this._proposalRepository = _proposalRepository;
        this._jobAssignmentRepository = _jobAssignmentRepository;
        this._userRepository = _userRepository;
        this._clarificationBoardRepository = _clarificationBoardRepository;
        this._paymentRepository = _paymentRepository;
        this._walletRepository = _walletRepository;
        this._walletTransactionRepository = _walletTransactionRepository;
        this._sessionProvider = _sessionProvider;
        this._notificationService = _notificationService;
    }
    async createJob(jobData) {
        const parsed = job_schema_1.createJobSchema.safeParse(jobData);
        if (!parsed.success) {
            const errors = parsed.error.format();
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, `Job validation failed: ${JSON.stringify(errors)}`);
        }
        const result = await this._jobRepository.create(jobData);
        const clarificationBoardExists = await this._clarificationBoardRepository.findOne({ jobId: result._id });
        if (clarificationBoardExists) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "Clarification board already exists");
        }
        //clarification board auto-created when creating job
        await this._clarificationBoardRepository.create({ jobId: result._id });
        // Auto notification
        await this._notificationService.createNotification({
            scope: "role",
            roles: [user_constants_1.UserRole.FREELANCER],
            category: "job_posted",
            subject: "New job posted",
            message: `A new job "${result.title}" has been posted. Check it out and place your bid.`,
            sendAs: "in-app",
            createdBy: result.clientId, // createdby job owner
        });
        return job_mapper_1.JobMapper.toDetailDTO(result);
    }
    async getAllJobs(freelancerId, status, search, limit, cursor, filters, sort = "newest") {
        let interestedJobIds = [];
        if (freelancerId) {
            const user = await this._userRepository.findById(freelancerId);
            if (user && user.role === user_constants_1.UserRole.FREELANCER) {
                interestedJobIds = user.interests
                    ?.filter(i => i.type === "freelancerJob" && i.jobId)
                    .map(i => i.jobId.toString()) ?? [];
            }
        }
        const filter = {
            status: "open",
            visibility: "public",
            isDeleted: false,
            $or: [
                { isMultiFreelancer: true },
                { acceptedProposalIds: { $size: 0 } }
            ]
        };
        // buget based sort
        const sortQuery = (0, buildJobSort_1.buildJobSort)(sort);
        if (status)
            filter.status = status;
        // cursor for infinite scroll
        if (cursor && cursor !== "undefined" && cursor !== "null") {
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
            if (filters.budgetMin !== undefined)
                filter["payment.budget"].$gte = filters.budgetMin;
            if (filters.budgetMax !== undefined)
                filter["payment.budget"].$lte = filters.budgetMax;
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
        if (filters?.hoursPerDay !== undefined) {
            filter.hoursPerDay = { $lte: filters.hoursPerDay };
        }
        // Skills
        if (filters?.skills && filters.skills.length > 0) {
            filter.skills = { $all: filters.skills.map(id => new mongoose_1.Types.ObjectId(id)) };
        }
        const jobs = await this._jobRepository.findWithSkillsPaginated(filter, limit, sortQuery);
        //setting cursor for infinite scroll
        const nextCursor = jobs.length > 0
            ? jobs[jobs.length - 1]._id.toString()
            : null;
        return {
            jobs: jobs.map(job => ({
                ...job_mapper_1.JobMapper.toListDTO(job),
                isInterested: interestedJobIds.includes(job.id)
            })),
            nextCursor
        };
    }
    async getJobById(jobId, user) {
        if (!jobId)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Job id is needed');
        const job = await this._jobRepository.findByIdWithDetails(jobId);
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, 'Job not found');
        // to prevent job detail from other clients
        if (user.role === user_constants_1.UserRole.CLIENT) {
            // because of populate client user
            const clientId = typeof job.clientId === "string" || job.clientId instanceof mongoose_1.Types.ObjectId
                ? job.clientId.toString()
                : job.clientId._id.toString();
            if (clientId.toString() !== user._id.toString()) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, 'You cannot view jobs posted by other clients.');
            }
        }
        return job_mapper_1.JobMapper.toDetailDTO(job);
    }
    async updateJob(jobId, jobData) {
        if (!jobId)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Job id is needed');
        const updated = await this._jobRepository.findByIdAndUpdate(jobId, jobData);
        if (!updated)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, 'Job not found');
        return job_mapper_1.JobMapper.toDetailDTO(updated);
    }
    async deleteJob(jobId) {
        if (!jobId)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Job id is needed');
        const result = await this._jobRepository.updateOne({ _id: jobId }, { isDeleted: true });
        if (!result)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        return 'Job is deleted';
    }
    async getClientJobs(clientId, status, search, limit, cursor, filters, sort = "newest") {
        const filter = { clientId, isDeleted: false };
        if (status) {
            filter.status = status;
        }
        // cursor for infinite scroll
        if (cursor && cursor !== "undefined" && cursor !== "null") {
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
        // house per day 
        if (filters?.hoursPerDay !== undefined) {
            filter.hoursPerDay = { $lte: filters.hoursPerDay };
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
            filter.skills = { $all: filters.skills.map(id => new mongoose_1.Types.ObjectId(id)) };
        }
        // sort filter
        const sortQuery = (0, buildJobSort_1.buildJobSort)(sort);
        const jobs = await this._jobRepository.findWithSkillsPaginated(filter, limit, sortQuery);
        //setting cursor for infinite scroll
        const nextCursor = jobs.length > 0
            ? jobs[jobs.length - 1]._id.toString()
            : null;
        return {
            jobs: jobs.map(job => job_mapper_1.JobMapper.toDetailDTO(job)),
            nextCursor
        };
    }
    async changeStatus(jobId, clientId, status) {
        const allowed = ["open", "active", "completed", "cancelled"];
        if (!allowed.includes(status)) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.INVALID_STATUS);
        }
        const job = await this._jobRepository.findById(jobId);
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        if (job.clientId.toString() !== clientId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Not allowed");
        }
        await this._jobRepository.findByIdAndUpdate(jobId, { status });
    }
    async startJob(jobId, clientId) {
        const job = await this._jobRepository.findById(jobId);
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        if (job.clientId.toString() !== clientId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Not allowed");
        }
        if (job.status !== "open") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "Job must be in open state to activate");
        }
        if (job.acceptedProposalIds.length === 0) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, "No accepted proposal exists for this job");
        }
        // to reject all other proposals
        await this._proposalRepository.updateMany({
            jobId: job._id,
            _id: { $nin: job.acceptedProposalIds }
        }, { $set: { status: 'rejected' } });
        const proposals = await this._proposalRepository.find({
            _id: { $in: job.acceptedProposalIds }
        });
        if (!proposals || proposals.length === 0) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, "Accepted proposals not found");
        }
        const totalAmount = proposals.reduce((acc, proposal) => acc + (proposal.bidAmount || 0), 0);
        await this._jobAssignmentRepository.updateMany({ proposalId: { $in: job.acceptedProposalIds } }, { status: "active" });
        const updatedJob = await this._jobRepository.findByIdAndUpdate(jobId, {
            $set: {
                status: "active",
                "payment.budget": totalAmount
            }
        });
        if (!updatedJob)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        return job_mapper_1.JobMapper.toDetailDTO(updatedJob);
    }
    async getFreelancerJobs(freelancerId, status, search, limit, cursor, filters, sort = "newest") {
        const assignmentFilter = { freelancerId: new mongoose_1.Types.ObjectId(freelancerId) };
        if (status) {
            assignmentFilter.status = status;
        }
        // cursor for infinite scroll
        if (cursor && cursor !== "undefined" && cursor !== "null") {
            assignmentFilter._id = { $lt: cursor };
        }
        const jobFilter = { "job.isDeleted": false };
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
        // hours per day 
        if (filters?.hoursPerDay !== undefined) {
            jobFilter["job.hoursPerDay"] = { $lte: filters.hoursPerDay };
        }
        // Skills
        if (filters?.skills && filters.skills.length > 0) {
            jobFilter["job.skills"] = { $all: filters.skills.map(id => new mongoose_1.Types.ObjectId(id)) };
        }
        // sort filter
        let sortQuery;
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
        const assignments = await this._jobAssignmentRepository.findWithJobDetailPaginated(assignmentFilter, jobFilter, sortQuery, limit);
        if (!assignments || assignments.length === 0) {
            return { jobs: [], nextCursor: null };
        }
        const jobs = assignments.map(a => a.job);
        //setting cursor for infinite scroll
        const nextCursor = jobs.length > 0
            ? jobs[jobs.length - 1]._id.toString()
            : null;
        return {
            jobs: jobs.map(job => job_mapper_1.JobMapper.toListDTO(job)),
            nextCursor
        };
    }
    async getInterestedJobsForFreelancer(freelancerId, search, limit, cursor, filters, sort = "newest") {
        const user = await this._userRepository.findById(freelancerId);
        if (!user)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        const interestedJobIds = user.interests
            ?.filter(i => i.type === "freelancerJob" && i.jobId)
            .map(i => i.jobId?.toString());
        if (!interestedJobIds?.length)
            return { jobs: [], nextCursor: null };
        const filter = { _id: { $in: interestedJobIds }, isDeleted: false };
        if (cursor && cursor !== "undefined" && cursor !== "null") {
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
            if (filters.budgetMin !== undefined)
                filter["payment.budget"].$gte = filters.budgetMin;
            if (filters.budgetMax !== undefined)
                filter["payment.budget"].$lte = filters.budgetMax;
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
        // hours per day filter
        if (filters?.hoursPerDay !== undefined) {
            filter.hoursPerDay = { $lte: filters.hoursPerDay };
        }
        if (filters?.skills && filters.skills.length > 0) {
            filter.skills = { $all: filters.skills.map(id => new mongoose_1.Types.ObjectId(id)) };
        }
        // sort filter
        const sortQuery = (0, buildJobSort_1.buildJobSort)(sort);
        const jobs = await this._jobRepository.findWithSkillsPaginated(filter, limit, sortQuery);
        const nextCursor = jobs.length > 0
            ? jobs[jobs.length - 1]._id.toString()
            : null;
        return {
            jobs: jobs.map(job => ({
                ...job_mapper_1.JobMapper.toListDTO(job),
                isInterested: interestedJobIds.includes(job.id)
            })),
            nextCursor
        };
    }
    async addJobInterest(freelancerId, jobId) {
        await this._userRepository.updateOne({ _id: freelancerId }, {
            $addToSet: {
                interests: {
                    type: "freelancerJob",
                    jobId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        });
    }
    async removeJobInterest(freelancerId, jobId) {
        await this._userRepository.updateOne({ _id: freelancerId }, {
            $pull: {
                interests: {
                    type: "freelancerJob",
                    jobId
                }
            }
        });
    }
    async cancelJob(jobId, user) {
        if (!jobId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Job id is required');
        }
        // transaction session
        return this._sessionProvider.runInTransaction(async (session) => {
            const job = await this._jobRepository.findByIdWithSession(jobId, session);
            if (!job) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, 'Job not found');
            }
            if (user.role !== user_constants_1.UserRole.CLIENT || job.clientId.toString() !== user._id.toString()) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, 'You are not allowed to cancel this job');
            }
            if (job.status !== 'open') {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Only open jobs can be cancelled');
            }
            const assignments = await this._jobAssignmentRepository.findWithSession({ jobId: job._id }, session);
            for (const assignment of assignments) {
                // if milestones is empty
                if (!assignment.milestones || assignment.milestones.length === 0) {
                    assignment.status = 'cancelled';
                    await assignment.save({ session });
                    continue;
                }
                for (const milestone of assignment.milestones) {
                    if (milestone.status === 'funded' && milestone.paymentId) {
                        const payment = await this._paymentRepository.findByIdWithSession(milestone.paymentId.toString(), session);
                        if (payment && payment.status === 'completed') {
                            const clientWallet = await this._walletRepository.findOneWithSession({ userId: payment.clientId, role: user_constants_1.UserRole.CLIENT, status: 'active' }, session);
                            if (!clientWallet) {
                                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Client wallet not found');
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
exports.JobService = JobService;
