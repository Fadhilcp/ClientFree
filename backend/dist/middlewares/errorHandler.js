"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler = (err, req, res, _next) => {
    let statusCode = status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR;
    let message = responseMessage_constant_1.HttpResponse.SERVER_ERROR;
    let code;
    if (err instanceof httpError_util_1.HttpError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
        statusCode = status_constants_1.HttpStatus.UNAUTHORIZED;
        message = responseMessage_constant_1.HttpResponse.TOKEN_EXPIRED;
        code = 'TOKEN_EXPIRED';
        return res.status(statusCode).json({ error: message, code, expiredAt: err.expiredAt });
    }
    else if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
        statusCode = status_constants_1.HttpStatus.UNAUTHORIZED;
        message = responseMessage_constant_1.HttpResponse.TOKEN_EXPIRED;
        code = 'TOKEN_INVALID';
        return res.status(statusCode).json({ error: message, code });
    }
    else {
        console.log('Unhandled Error', err);
    }
    res.status(statusCode).json({ error: message });
};
exports.errorHandler = errorHandler;
