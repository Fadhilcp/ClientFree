import { Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { HttpResponse } from "constants/responseMessage.constant";
import { env } from "config/env.config";

interface SocketUserPayload extends JwtPayload {
    userId: string;
    role: "client" | "freelancer" | "admin";
}

export const socketAuthMiddleware = (
    socket: Socket,
    next: (err?: Error) => void
) => {
    try {
        
        const token = 
            socket.handshake.auth.token || 
            socket.handshake.headers.authorization?.split(" ")[1];
        
        if(!token) return next(new Error(HttpResponse.UNAUTHORIZED));
        
        if(!env.JWT_ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET is not configured");

        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

        if (typeof decoded !== "object" || !decoded._id || !decoded.role) {
            return next(new Error(HttpResponse.UNAUTHORIZED));
        }

        socket.data.user = decoded as SocketUserPayload;
        next();
    } catch (error) {
        next(new Error(HttpResponse.UNAUTHORIZED));
    }
};