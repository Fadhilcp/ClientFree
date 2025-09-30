import express from 'express';
import { connectDB } from './config/mongo.config.js';
import { env } from './config/env.config.js';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express();



connectDB();

app.use(cors({
    origin : 'http://localhost:5173',
    methods : ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders : ['Content-Type', 'Authorization'],
    credentials : true
}))

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended : true}));


app.use("/auth",authRouter)


app.listen(env.PORT || 3000,()=>{
    console.log(`server is running at ${env.PORT} port`);
})