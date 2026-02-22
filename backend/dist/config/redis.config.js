"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
const env_config_1 = require("./env.config");
exports.redis = (0, redis_1.createClient)({
    username: 'default',
    password: env_config_1.env.REDIS_PASSWORD,
    socket: {
        host: env_config_1.env.REDIS_HOST,
        port: Number(env_config_1.env.REDIS_PORT)
    }
});
exports.redis.on('error', err => console.log('Redis Client Error', err));
async function connectRedis() {
    try {
        await exports.redis.connect();
        console.log("Redis connected");
    }
    catch (error) {
        console.error("Startup failed", error);
        process.exit(1);
    }
}
