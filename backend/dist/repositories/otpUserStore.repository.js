"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpUserStoreRepository = void 0;
const base_repository_1 = require("./base.repository");
const otpUserStore_model_1 = __importDefault(require("../models/otpUserStore.model"));
class OtpUserStoreRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(otpUserStore_model_1.default);
    }
    findByEmail(email) {
        return this.model.findOne({ email });
    }
    findByEmailAndOtp(email, otp) {
        return this.model.findOne({ email, otp });
    }
}
exports.OtpUserStoreRepository = OtpUserStoreRepository;
