import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { JwtPayload } from "jsonwebtoken";


export const verifyToken = ( req : Request, res : Response, next : NextFunction ) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message : 'Access token missing or malformed'});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);

        if(typeof decoded === 'string'){
            return res.status(401).json({ message : 'Invalid token payload'})
        }

        const { _id, email, role } = decoded as JwtPayload;

        req.user = { _id, email, role };
        next()
        
    } catch (error) {
        return res.status(401).json({ error : error || 'Access token expired or invalid'})
    }
}