"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const env_config_1 = require("./env.config");
if (!env_config_1.env.AWS_ACCESS_KEY)
    throw new Error("AWS_ACCESS_KEY_ID missing");
if (!env_config_1.env.AWS_SECRET_ACCESS_KEY)
    throw new Error("AWS_SECRET_ACCESS_KEY missing");
const s3 = new client_s3_1.S3Client({
    region: env_config_1.env.AWS_REGION,
    credentials: {
        accessKeyId: env_config_1.env.AWS_ACCESS_KEY,
        secretAccessKey: env_config_1.env.AWS_SECRET_ACCESS_KEY
    }
});
exports.default = s3;
