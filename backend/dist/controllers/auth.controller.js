"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const refreshCookie_util_1 = require("../utils/refreshCookie.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
class AuthController {
    constructor(_authService) {
        this._authService = _authService;
    }
    async signUp(req, res, next) {
        try {
            const { username, email, password, role } = req.body;
            await this._authService.signUp({ username, email, password, role });
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.CREATED, {
                email
            }, 'OTP sent to your email. Please verify to complete signup');
        }
        catch (error) {
            next(error);
        }
    }
    ;
    async verifySignupOtp(req, res, next) {
        try {
            const { email, otp, purpose } = req.body;
            const { user, accessToken, refreshToken } = await this._authService.verifySignupOtp(email, otp, purpose);
            (0, refreshCookie_util_1.setCookie)(res, refreshToken);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {
                token: accessToken,
                user
            }, "SignUp complete");
        }
        catch (error) {
            next(error);
        }
    }
    ;
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken, subscription } = await this._authService.login(email, password);
            (0, refreshCookie_util_1.setCookie)(res, refreshToken);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {
                token: accessToken,
                user,
                subscription
            }, "Login complete");
        }
        catch (error) {
            next(error);
        }
    }
    ;
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email || typeof email !== 'string') {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.INVALID_EMAIL);
            }
            await this._authService.forgotPassword(email);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, "OTP sent to your email");
        }
        catch (error) {
            next(error);
        }
    }
    async resendOtp(req, res, next) {
        try {
            const { email, purpose } = req.body;
            if (!email) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.INVALID_EMAIL);
            }
            if (!['signup', 'forgot-password', 'email-change', 'phone-change'].includes(purpose)) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Invalid OTP purpose');
            }
            await this._authService.resendOtp(email, purpose);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, responseMessage_constant_1.HttpResponse.OTP_RESENT_SUCCESS);
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOtp(req, res, next) {
        try {
            const { email, otp, purpose } = req.body;
            if (!email || !otp || !purpose) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, 'Email, OTP, and purpose are required');
            }
            await this._authService.verifyOtp(email, otp, purpose);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, responseMessage_constant_1.HttpResponse.OTP_VERIFIED_SUCCESS);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.EMAIL_AND_PASSWORD_REQUIRED);
            }
            await this._authService.resetPassword(email, password);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, responseMessage_constant_1.HttpResponse.PASSWORD_CHANGE_SUCCESS);
        }
        catch (error) {
            next(error);
        }
    }
    async accessRefreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;
            const { accessToken, newRefreshToken } = await this._authService.accessRefreshToken(refreshToken);
            (0, refreshCookie_util_1.setCookie)(res, newRefreshToken);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {
                token: accessToken
            }, "Access token generated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    async googleAuth(req, res, next) {
        try {
            const { token, role } = req.body;
            if (!token) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.NO_TOKEN);
            }
            const result = await this._authService.googleAuth(token, role);
            if (result.needsRole) {
                (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {
                    needsRole: result.needsRole
                }, "New user needs to select role");
                return;
            }
            if (result.refreshToken)
                (0, refreshCookie_util_1.setCookie)(res, result.refreshToken);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {
                user: result.user,
                token: result.accessToken,
                isNewUser: result.isNewUser,
            }, "Google authentication successful");
        }
        catch (error) {
            next(error);
        }
    }
    async getNewAccessToken(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                // throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.REFRESH_TOKEN_MISSING);
                (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.UNAUTHORIZED, {}, responseMessage_constant_1.HttpResponse.REFRESH_TOKEN_MISSING);
                return;
            }
            const { user, accessToken, subscription } = await this._authService.getNewAccessToken(refreshToken);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {
                user,
                token: accessToken,
                subscription
            }, "New access token issued");
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const userId = req.user?._id;
            const { password, newPassword, confirmPassword } = req.body;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            if (newPassword !== confirmPassword) {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.PASSWORD_NOT_MATCH);
            }
            const { message } = await this._authService.changePassword(userId, password, newPassword);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, message);
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            (0, refreshCookie_util_1.clearCookie)(res);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, {}, responseMessage_constant_1.HttpResponse.LOGOUT_SUCCESS);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
;
