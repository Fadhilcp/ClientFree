import mongoose from "mongoose";
import { env } from "../config/env.config.js";



export async function connectDB() {
    try {
        const MONGO_URI = env.MONGO_DB as string;

        await mongoose.connect(MONGO_URI);
        console.log("connected with MongoDB");
        
    } catch (error) {
        console.error("MongoDB connection error :",error);
        process.exit(1)
    }
}