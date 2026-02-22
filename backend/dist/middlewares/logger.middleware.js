"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../config/logger"));
const requestLogger = (req, res, next) => {
    const start = Date.now();
    logger_1.default.info(`Incoming request: ${req.method}`);
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${req.statusCode} - ${duration}ms`;
        if (res.statusCode >= 500) {
            logger_1.default.error(message);
        }
        else if (res.statusCode >= 400) {
            logger_1.default.warn(message);
        }
        else {
            logger_1.default.info(message);
        }
    });
    next();
};
exports.default = requestLogger;
