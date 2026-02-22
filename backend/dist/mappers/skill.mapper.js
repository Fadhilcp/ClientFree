"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSkill = mapSkill;
function mapSkill(skill) {
    return {
        id: skill._id.toString(),
        name: skill.name,
        category: skill.category,
        status: skill.status,
    };
}
