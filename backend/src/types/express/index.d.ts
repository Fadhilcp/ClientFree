import { AuthPayload } from "../auth.type";

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}