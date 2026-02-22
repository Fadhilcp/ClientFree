"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClarificationBoardRepository = void 0;
const base_repository_1 = require("./base.repository");
const clarificationBoard_model_1 = __importDefault(require("../models/clarificationBoard.model"));
class ClarificationBoardRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(clarificationBoard_model_1.default);
    }
}
exports.ClarificationBoardRepository = ClarificationBoardRepository;
