
import { IUserDocument } from "../types/user.type";

export type SanitizedUser = Pick<IUserDocument, "_id" | "username" | "email" | "role">;
