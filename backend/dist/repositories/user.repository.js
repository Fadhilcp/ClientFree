"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
const user_model_1 = __importDefault(require("./../models/user.model"));
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(user_model_1.default);
    }
    async findByEmail(email) {
        return this.model.findOne({ email });
    }
    async findStatusById(id) {
        return this.model.findById(id).select("status");
    }
    async findWithSkill(filter) {
        return this.model.find(filter)
            .populate("skills", "name _id");
    }
    async findClients() {
        return this.model.find({ role: "client" });
    }
    async findByLocation(city, country, state) {
        const filter = {};
        if (city)
            filter["location.city"] = city;
        if (country)
            filter["location.country"] = country;
        if (state)
            filter["location.state"] = state;
        return this.model.find(filter);
    }
    async findByIdWithSkills(userId) {
        return this.model.findById(userId).populate("skills", "name _id");
    }
    async findWithSkillsPaginated(filter, limit) {
        const paginatedFilter = { ...filter };
        return this.model
            .find(paginatedFilter)
            .sort({ _id: -1 })
            .limit(limit)
            .populate("skills", "name _id")
            .exec();
    }
    async resetSubscriptionState(userId, limits, session) {
        await this.model.updateOne({ _id: userId }, {
            $set: {
                limits,
                isVerified: false,
                subscription: null,
            },
        }, { session });
    }
    async searchForSelect(filter, page, limit) {
        return this.model.find(filter)
            .select("username email")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
    }
    async findByIds(userIds) {
        return this.model.find({ _id: { $in: userIds } }, { username: 1, email: 1 }).lean();
    }
}
exports.UserRepository = UserRepository;
