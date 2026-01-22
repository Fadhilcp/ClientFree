import express from 'express';
const app = express();
import { connectDB } from './config/mongo.config';
import { env } from './config/env.config';

import apiRoutes from "./routes"

import cookieParser from 'cookie-parser'
import cors from 'cors';

import { errorHandler } from './middlewares/errorHandler';
import requestLogger from './middlewares/logger.middleware';
import { startSubscriptionExpiryCron } from './utils/subscriptionExpiry.cron';
import { connectRedis } from './config/redis.config';
import stripeWebhookRouter from './routes/stripeWebhook.route';

connectDB();
connectRedis();
startSubscriptionExpiryCron();

app.use(cors({
    origin : env.CORS_ORIGIN,
    methods : env.CORS_METHODS?.split(","),
    allowedHeaders : env.CORS_ALLOWED_HEADERS?.split(","),
    credentials : env.CORS_CREDENTIALS === "true",
}));

app.use("/api/webhooks", stripeWebhookRouter);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(requestLogger);

app.use("/api", apiRoutes);

app.use(errorHandler);

export default app;