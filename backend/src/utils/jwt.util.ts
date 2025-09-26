import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
import { IUserDocument } from "../types/user.type.js";

const ACCESS_SECRET = env.ACCESS_SECRET as string;
const REFRESH_SECRET = env.REFRESH_SECRET as string;


export const generateAccessToken = (user : IUserDocument) : string => {
    return jwt.sign(
        { _id : user._id, email : user.email, role : user.role },
        ACCESS_SECRET,
        { expiresIn : '15m'}
    );
};

export const generateRefreshToken = (user : IUserDocument) : string => {
    return jwt.sign(
        { _id : user._id },
        REFRESH_SECRET,
        { expiresIn : '7d'}
    );
}; 