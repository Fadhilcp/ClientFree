
import { IUserDocument } from "./user.type.js";

export type SanitizedUser = Pick<IUserDocument, "_id" | "username" | "email" | "role">;