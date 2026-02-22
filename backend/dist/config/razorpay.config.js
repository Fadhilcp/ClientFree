"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRazorpayInstance = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const env_config_1 = require("./env.config");
let razorpayInstance = null;
const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        razorpayInstance = new razorpay_1.default({
            key_id: env_config_1.env.RAZORPAY_KEY_ID,
            key_secret: env_config_1.env.RAZORPAY_SECRET
        });
    }
    return razorpayInstance;
};
exports.getRazorpayInstance = getRazorpayInstance;
