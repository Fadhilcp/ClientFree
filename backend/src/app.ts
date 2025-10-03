import express from 'express';
const app = express();
import { connectDB } from './config/mongo.config.js';
import { env } from './config/env.config.js';

import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { errorHandler } from './middlewares/errorHandler.js';
import profileRouter from './routes/profile.route.js';


connectDB();

app.use(cors({
    origin : 'http://localhost:5173',
    methods : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders : ['Content-Type', 'Authorization'],
    credentials : true
}))

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended : true}));


app.use("/api/auth",authRouter)
app.use("/api/profile",profileRouter)

app.use(errorHandler)

app.listen(env.PORT || 3000,()=>{
    console.log(`server is running at ${env.PORT} port`);
})