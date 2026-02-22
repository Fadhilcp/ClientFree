"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanRepository = void 0;
const base_repository_1 = require("./base.repository");
const plan_model_1 = __importDefault(require("../models/plan.model"));
class PlanRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(plan_model_1.default);
    }
}
exports.PlanRepository = PlanRepository;
