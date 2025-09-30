import { JwtPayload } from "jsonwebtoken";
import { StringLiteral } from "typescript";

declare global {
    namespace Express {
        interface Request {
            user ?: JwtPayload & {
                _id ?: string;
                email ?: string;
                role ?: 'freelancer' | 'client' | 'admin';
            }
        }
    }
}