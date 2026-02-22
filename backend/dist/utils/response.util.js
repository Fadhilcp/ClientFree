"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, statusCode, payload, message = '', success = true) => {
    res.status(statusCode).json({
        success,
        message,
        ...payload,
    });
};
exports.sendResponse = sendResponse;
