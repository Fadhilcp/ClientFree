import express from 'express';
import { connectDB } from './config/mongo.config.js';
import { env } from './config/env.config.js';
const app = express();

import dotenv from 'dotenv';
dotenv.config();


connectDB();

app.use(express.json());
app.use(express.urlencoded({extended : true}));



app.listen(env.PORT || 3000,()=>{
    console.log(`server is running at ${env.PORT} port`);
})