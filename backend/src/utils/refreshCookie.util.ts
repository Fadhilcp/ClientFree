import { env } from "../config/env.config";
import { Response } from "express";

export function setCookie(res : Response, refreshToken : string) {
    res.cookie("refreshToken", refreshToken, {
        httpOnly : true,
        secure: env.COOKIE_SECURE,
        maxAge: env.REFRESH_COOKIE_MAX_AGE,
        sameSite: env.COOKIE_SAMESITE,
        path: '/',
    })
};

export function clearCookie(res : Response){
    res.clearCookie('refreshToken', {
        httpOnly : true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAMESITE,
        path: '/'
    })
}