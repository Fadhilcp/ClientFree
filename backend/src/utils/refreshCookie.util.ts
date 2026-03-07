import { Response } from "express";

export function setCookie(res : Response, refreshToken : string) {
    res.cookie("refreshToken", refreshToken, {
        httpOnly : true,
        secure : true,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        sameSite : 'none',
        path: '/',
    })
};

export function clearCookie(res : Response){
    res.clearCookie('refreshToken', {
        httpOnly : true,
        secure : true,
        sameSite : 'none'
    })
}