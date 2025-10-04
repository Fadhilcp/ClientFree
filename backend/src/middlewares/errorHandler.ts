import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError.util";
import { HttpStatus } from "../constants/status.constants";
import { HttpResponse } from "../constants/responseMessage.constant";
import jwt from 'jsonwebtoken';

export const errorHandler = ( 
    err : HttpError | Error,
    req : Request,
    res : Response,
    next : NextFunction
) => {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = HttpResponse.SERVER_ERROR;
    let code : string | undefined;

    if(err instanceof HttpError){
        statusCode = err.statusCode;
        message = err.message;
    }
    else if(err instanceof jwt.TokenExpiredError){
        statusCode = HttpStatus.UNAUTHORIZED;
        message = HttpResponse.TOKEN_EXPIRED;
        code = 'TOKEN_EXPIRED';
        return res.status(statusCode).json({ error: message, code, expiredAt: err.expiredAt });
    }
    else if(err instanceof jwt.JsonWebTokenError){
        statusCode = HttpStatus.UNAUTHORIZED;
        message = HttpResponse.TOKEN_EXPIRED;
        code = 'TOKEN_INVALID';
        return res.status(statusCode).json({ error: message, code });
    }
    else{
        console.log('Unhandled Error',err)
    }

    res.status(statusCode).json({ error: message });
};