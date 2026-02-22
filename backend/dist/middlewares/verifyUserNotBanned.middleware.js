"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserNotBanned = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const user_repository_1 = require("../repositories/user.repository");
const httpError_util_1 = require("../utils/httpError.util");
const userRepository = new user_repository_1.UserRepository();
const verifyUserNotBanned = async (req, res, next) => {
    if (!req.user?._id) {
        throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
    }
    try {
        const user = await userRepository.findStatusById(req.user._id);
        if (!user) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        }
        if (user.status === "banned") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Your account is banned");
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifyUserNotBanned = verifyUserNotBanned;
