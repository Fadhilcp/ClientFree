import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "./env.config";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// retention period for logs
const combinedTransport = new DailyRotateFile({
    dirname: env.LOG_DIR,
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: `${env.LOG_RETENTION_DAYS}d`,
    maxSize: env.LOG_MAX_FILE_SIZE
});

const errorTransport = new DailyRotateFile({
    dirname: env.LOG_DIR,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: `${env.LOG_RETENTION_DAYS}d`,
    maxSize: env.LOG_MAX_FILE_SIZE
});

const logger = createLogger({
    level: env.LOG_LEVEL,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
        logFormat
    ),
    transports: [
        combinedTransport,
        errorTransport,

        new transports.Console({
            format: combine(colorize(), logFormat),
        }),
    ],
});

export default logger;