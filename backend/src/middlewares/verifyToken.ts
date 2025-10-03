import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { JwtPayload } from "jsonwebtoken";



export const authMiddleware = ( req : Request, res : Response, next : NextFunction ) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message : 'Access token missing or malformed'});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);

        req.user = decoded;
        // (req as any).user = decoded;
        next()
        
    } catch (error) {
        return res.status(401).json({ message : 'Access token expired or invalid'})
    }
}