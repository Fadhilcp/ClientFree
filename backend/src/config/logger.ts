import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// retention period for logs
const combinedTransport = new DailyRotateFile({
    dirname: 'logs',
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    maxSize: '20m'
});

const errorTransport = new DailyRotateFile({
    dirname: 'logs',
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '14d',
    maxSize: '20m'
});

const logger = createLogger({
    level: 'info',
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