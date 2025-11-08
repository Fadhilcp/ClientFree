import { Schema, model } from "mongoose";
import { ISkillDocument } from "types/skill.type";

const skillSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    },
    normalizedName: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });

export default model<ISkillDocument>('Skill', skillSchema);