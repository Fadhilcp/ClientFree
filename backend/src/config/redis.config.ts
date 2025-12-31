import { createClient } from 'redis';
import { env } from './env.config';

export const redis = createClient({
    username: 'default',
    password: env.REDIS_PASSWORD,
    socket: {
        host: env.REDIS_HOST,
        port: Number(env.REDIS_PORT)
    }
});

redis.on('error', err => console.log('Redis Client Error', err));



export async function connectRedis() {
    try {
        await redis.connect();
        console.log("Redis connected");
    } catch (error) {
        console.error("Startup failed", error);
        process.exit(1);
    }
}