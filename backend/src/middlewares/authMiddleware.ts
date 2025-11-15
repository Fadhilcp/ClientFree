import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { Request, Response, NextFunction } from "express";
import { createHttpError } from "utils/httpError.util";
import { verifyAccessToken } from "utils/jwt.util";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if(!token){
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.NO_TOKEN)
        }
        
        const decoded = verifyAccessToken(token);
        console.log("🚀 ~ authMiddleware ~ decoded:", decoded)
        req.user = decoded;
        next();
    } catch (error) {
        next(error)
    }
}