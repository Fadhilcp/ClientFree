import express from 'express';
const app = express();
import { connectDB } from './config/mongo.config';
import { env } from './config/env.config';

import authRouter from './routes/auth.route';
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { errorHandler } from './middlewares/errorHandler';
import profileRouter from './routes/profile.route';
import skillRouter from 'routes/skill.route';
import subscriptionRouter from 'routes/subscription.route';
import planRouter from 'routes/plan.route';

connectDB();

app.use(cors({
    origin : 'http://localhost:5173',
    methods : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders : ['Content-Type', 'Authorization'],
    credentials : true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/auth",authRouter);
app.use("/api/profile",profileRouter);
app.use("/api/skills",skillRouter);
app.use("/api/plan",planRouter);
app.use("/api/subscription",subscriptionRouter);

app.use(errorHandler);

app.listen(env.PORT || 3000,() => {
    console.log(`server is running at ${env.PORT} port`);
})