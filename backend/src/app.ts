import express from 'express';
const app = express();
import { connectDB } from './config/mongo.config';
import { env } from './config/env.config';

import authRouter from './routes/auth.route';
import cookieParser from 'cookie-parser'
import cors from 'cors';

import { errorHandler } from './middlewares/errorHandler';
import userRouter from './routes/user.route';
import skillRouter from 'routes/skill.route';
import subscriptionRouter from 'routes/subscription.route';
import planRouter from 'routes/plan.route';
import requestLogger from 'middlewares/logger.middleware';
import jobRouter from 'routes/job.route';
import proposalRouter from 'routes/proposal.route';
import assignmentRouter from 'routes/jobAssignment.route';
import paymentRouter from 'routes/payment.route';
import addOnRouter from 'routes/addOns.route';
import clarificationRouter from 'routes/clarification.route';
import walletRouter from 'routes/wallet.route';
import dashboardRouter from 'routes/dashboard.route';
import { startSubscriptionExpiryCron } from 'utils/subscriptionExpiry.cron';
import { connectRedis } from 'config/redis.config';
import matchRouter from 'routes/match.route';

connectDB();
startSubscriptionExpiryCron();

connectRedis();

app.use(cors({
    origin : 'http://localhost:5173',
    methods : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders : ['Content-Type', 'Authorization'],
    credentials : true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(requestLogger);

app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);
app.use("/api/skills",skillRouter);
app.use("/api/plans",planRouter);
app.use("/api/subscription",subscriptionRouter);
app.use("/api/jobs",jobRouter);
app.use("/api/proposal",proposalRouter);
app.use("/api/assignment",assignmentRouter);
app.use("/api/payment",paymentRouter);
app.use("/api/addOns",addOnRouter);
app.use("/api/clarification",clarificationRouter);
app.use("/api/wallet",walletRouter);
app.use("/api/dashboard",dashboardRouter);
app.use("/api/match",matchRouter);

app.use(errorHandler);

app.listen(env.PORT || 3000,() => {
    console.log(`server is running at ${env.PORT} port`);
})