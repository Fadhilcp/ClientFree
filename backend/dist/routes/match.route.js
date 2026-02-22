"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const match_controller_1 = require("../controllers/match.controller");
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const verifyUserNotBanned_middleware_1 = require("../middlewares/verifyUserNotBanned.middleware");
const session_provider_1 = require("../repositories/db/session-provider");
const job_repository_1 = require("../repositories/job.repository");
const plan_repository_1 = require("../repositories/plan.repository");
const subscription_repository_1 = require("../repositories/subscription.repository");
const user_repository_1 = require("../repositories/user.repository");
const match_service_1 = require("../services/match.service");
const subscription_service_1 = require("../services/subscription.service");
const matchRouter = (0, express_1.Router)();
const jobRepository = new job_repository_1.JobRepository();
const userRepository = new user_repository_1.UserRepository();
const subscriptionRepository = new subscription_repository_1.SubscriptionRepository();
const planRepository = new plan_repository_1.PlanRepository();
// transaction session
const sessionProvider = new session_provider_1.MongooseSessionProvider();
// subscription service
const subscriptionService = new subscription_service_1.SubscriptionService(subscriptionRepository, planRepository, userRepository, sessionProvider);
const matchService = new match_service_1.MatchService(jobRepository, userRepository, subscriptionService);
const matchController = new match_controller_1.MatchController(matchService);
matchRouter.use(authMiddleware_1.authMiddleware, verifyUserNotBanned_middleware_1.verifyUserNotBanned);
matchRouter.get("/jobs", matchController.getBestMatchJobs.bind(matchController));
matchRouter.get("/freelancers/:jobId", matchController.getBestMatchFreelancer.bind(matchController));
exports.default = matchRouter;
