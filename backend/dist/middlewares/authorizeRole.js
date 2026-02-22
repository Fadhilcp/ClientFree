"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const authorizeRole = (...allowedRoles) => (req, _res, next) => {
    if (!req.user) {
        return next((0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED));
    }
    if (!allowedRoles.includes(req.user.role)) {
        return next((0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, responseMessage_constant_1.HttpResponse.ACCESS_DENIED));
    }
    next();
};
exports.authorizeRole = authorizeRole;
