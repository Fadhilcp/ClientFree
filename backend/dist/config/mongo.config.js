"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = require("../config/env.config");
async function connectDB() {
    try {
        const MONGO_URI = env_config_1.env.MONGO_DB;
        await mongoose_1.default.connect(MONGO_URI);
        console.log("connected with MongoDB");
    }
    catch (error) {
        console.error("MongoDB connection error :", error);
        process.exit(1);
    }
}
