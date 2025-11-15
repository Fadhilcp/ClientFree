import jwt from "jsonwebtoken";
import { env } from "../config/env.config";
import { AuthPayload } from "../types/auth.type";

const ACCESS_SECRET = env.ACCESS_SECRET as string;
const REFRESH_SECRET = env.REFRESH_SECRET as string;


export const generateAccessToken = (payload : AuthPayload) : string => {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn : '15m'} );
};

export const generateRefreshToken = (payload :Pick<AuthPayload, '_id'>) : string => {
    return jwt.sign(
        { _id : payload._id },
        REFRESH_SECRET,
        { expiresIn : '7d'}
    );
}; 


export function verifyAccessToken(token : string) : AuthPayload {
    return jwt.verify(token, ACCESS_SECRET) as AuthPayload
};


type RefreshPayload = { _id : string };

export function verifyRefreshToken(token: string): RefreshPayload {

  const decoded = jwt.verify(token, REFRESH_SECRET);

  if (typeof decoded === 'string' || !('_id' in decoded)) {
    throw new Error('Invalid refresh token payload');
  }
  return decoded as RefreshPayload;
};