"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const review_model_1 = __importDefault(require("../models/review.model"));
const base_repository_1 = require("./base.repository");
class ReviewRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(review_model_1.default);
    }
}
exports.ReviewRepository = ReviewRepository;
