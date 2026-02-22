"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseSessionProvider = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class MongooseSessionProvider {
    async startSession() {
        return mongoose_1.default.startSession();
    }
    async runInTransaction(callback) {
        const session = await this.startSession();
        session.startTransaction();
        try {
            const result = await callback(session);
            await session.commitTransaction();
            session.endSession();
            return result;
        }
        catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }
}
exports.MongooseSessionProvider = MongooseSessionProvider;
