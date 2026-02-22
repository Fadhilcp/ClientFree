"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const env_config_1 = require("./env.config");
const { combine, timestamp, printf, colorize } = winston_1.format;
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});
// retention period for logs
const combinedTransport = new winston_daily_rotate_file_1.default({
    dirname: env_config_1.env.LOG_DIR,
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: `${env_config_1.env.LOG_RETENTION_DAYS}d`,
    maxSize: env_config_1.env.LOG_MAX_FILE_SIZE
});
const errorTransport = new winston_daily_rotate_file_1.default({
    dirname: env_config_1.env.LOG_DIR,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: `${env_config_1.env.LOG_RETENTION_DAYS}d`,
    maxSize: env_config_1.env.LOG_MAX_FILE_SIZE
});
const logger = (0, winston_1.createLogger)({
    level: env_config_1.env.LOG_LEVEL,
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    transports: [
        combinedTransport,
        errorTransport,
        new winston_1.transports.Console({
            format: combine(colorize(), logFormat),
        }),
    ],
});
exports.default = logger;
