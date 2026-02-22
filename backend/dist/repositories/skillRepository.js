"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillRepository = void 0;
const skill_model_1 = __importDefault(require("../models/skill.model"));
const base_repository_1 = require("./base.repository");
class SkillRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(skill_model_1.default);
    }
}
exports.SkillRepository = SkillRepository;
