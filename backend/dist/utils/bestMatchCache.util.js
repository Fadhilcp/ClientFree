"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchCacheService = void 0;
const redis_config_1 = require("../config/redis.config");
class MatchCacheService {
    static key(jobId, freelancerId) {
        return `match:job:${jobId}:freelancer:${freelancerId}`;
    }
    static async get(jobId, freelancerId) {
        const data = await redis_config_1.redis.get(this.key(jobId, freelancerId));
        return data ? JSON.parse(data) : null;
    }
    static async set(jobId, freelancerId, score) {
        await redis_config_1.redis.set(this.key(jobId, freelancerId), JSON.stringify({ score, version: "v1" }), {
            EX: this.TTL,
        });
    }
}
exports.MatchCacheService = MatchCacheService;
MatchCacheService.TTL = 60 * 60 * 12;
