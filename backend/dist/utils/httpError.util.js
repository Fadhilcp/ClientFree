"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpError = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(statusCode = 500, message) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.HttpError = HttpError;
const createHttpError = (statusCode, message) => {
    return new HttpError(statusCode, message);
};
exports.createHttpError = createHttpError;
