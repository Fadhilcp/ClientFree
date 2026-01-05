import { redis } from "../config/redis.config";

export class MatchCacheService {
    private static TTL = 60 * 60 * 12;

    static key(jobId: string, freelancerId: string) {
        return `match:job:${jobId}:freelancer:${freelancerId}`;
    }

    static async get(jobId: string, freelancerId: string) {
        const data = await redis.get(this.key(jobId, freelancerId));
        return data ? JSON.parse(data) : null;
    }

    static async set(jobId: string, freelancerId: string, score: number) {
        await redis.set(
            this.key(jobId, freelancerId),
            JSON.stringify({ score, version: "v1" }),
            {
                EX: this.TTL,
            }
        );
    }
}
