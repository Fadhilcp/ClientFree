"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const env_config_1 = require("../config/env.config");
const socketAuthMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth.token ||
            socket.handshake.headers.authorization?.split(" ")[1];
        if (!token)
            return next(new Error(responseMessage_constant_1.HttpResponse.UNAUTHORIZED));
        if (!env_config_1.env.JWT_ACCESS_SECRET)
            throw new Error("JWT_ACCESS_SECRET is not configured");
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_ACCESS_SECRET);
        if (typeof decoded !== "object" || !decoded._id || !decoded.role) {
            return next(new Error(responseMessage_constant_1.HttpResponse.UNAUTHORIZED));
        }
        socket.data.user = decoded;
        next();
    }
    catch {
        next(new Error(responseMessage_constant_1.HttpResponse.UNAUTHORIZED));
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;
