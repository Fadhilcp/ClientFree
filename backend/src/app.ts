import express from 'express';
import process from 'process';
import { connectDB } from './config/mongo.config.js';
import { env } from './config/env.config.js';
const app = express();

import authRouter from './routes/auth.route.js';


connectDB();

app.use(express.json());
app.use(express.urlencoded({extended : true}));


app.use("/auth",authRouter)


app.listen(env.PORT || 3000,()=>{
    console.log(`server is running at ${env.PORT} port`);
})