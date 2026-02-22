"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const mongo_config_1 = require("./config/mongo.config");
const env_config_1 = require("./config/env.config");
const routes_1 = __importDefault(require("./routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_middleware_1 = __importDefault(require("./middlewares/logger.middleware"));
const subscriptionExpiry_cron_1 = require("./utils/subscriptionExpiry.cron");
const redis_config_1 = require("./config/redis.config");
const stripeWebhook_route_1 = __importDefault(require("./routes/stripeWebhook.route"));
(0, mongo_config_1.connectDB)();
(0, redis_config_1.connectRedis)();
(0, subscriptionExpiry_cron_1.startSubscriptionExpiryCron)();
app.use((0, cors_1.default)({
    origin: env_config_1.env.CORS_ORIGIN,
    methods: env_config_1.env.CORS_METHODS?.split(","),
    allowedHeaders: env_config_1.env.CORS_ALLOWED_HEADERS?.split(","),
    credentials: env_config_1.env.CORS_CREDENTIALS === "true",
}));
app.use("/api/webhooks", stripeWebhook_route_1.default);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_middleware_1.default);
app.use("/api", routes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
