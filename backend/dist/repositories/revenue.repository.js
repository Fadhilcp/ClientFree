"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueRepository = void 0;
const base_repository_1 = require("./base.repository");
const revenue_model_1 = __importDefault(require("../models/revenue.model"));
class RevenueRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(revenue_model_1.default);
    }
}
exports.RevenueRepository = RevenueRepository;
