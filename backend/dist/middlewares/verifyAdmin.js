"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const verifyAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CREATED, responseMessage_constant_1.HttpResponse.ACCESS_DENIED);
    }
    next();
};
exports.verifyAdmin = verifyAdmin;
