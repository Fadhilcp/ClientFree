import { Document, Types } from "mongoose";

export interface ISkill {
    name: string;
    category: string;
    status?: 'active' | 'inactive';
}

export interface ISkillDocument extends ISkill, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updateAt: Date;
}