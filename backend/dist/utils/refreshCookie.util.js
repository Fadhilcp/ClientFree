"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCookie = setCookie;
exports.clearCookie = clearCookie;
const env_config_1 = require("../config/env.config");
function setCookie(res, refreshToken) {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env_config_1.env.COOKIE_SECURE,
        maxAge: env_config_1.env.REFRESH_COOKIE_MAX_AGE,
        sameSite: env_config_1.env.COOKIE_SAMESITE,
        path: '/',
    });
}
;
function clearCookie(res) {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env_config_1.env.COOKIE_SECURE,
        sameSite: env_config_1.env.COOKIE_SAMESITE,
        path: '/'
    });
}
