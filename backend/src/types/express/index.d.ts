import { AuthPayload } from "types/auth.type";

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}