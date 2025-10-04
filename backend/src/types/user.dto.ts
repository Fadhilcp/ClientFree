
import { IUserDocument } from "./user.type";

export type SanitizedUser = Pick<IUserDocument, "_id" | "username" | "email" | "role">;
