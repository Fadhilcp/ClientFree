"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignedUrl = generateSignedUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const env_config_1 = require("../config/env.config");
const s3_config_1 = __importDefault(require("../config/s3.config"));
const DEFAULT_SIGNED_URL_EXPIRY = Number(env_config_1.env.AWS_SIGNED_URL_EXPIRES_IN ?? 3600);
async function generateSignedUrl(key, expiresIn = DEFAULT_SIGNED_URL_EXPIRY) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: env_config_1.env.AWS_BUCKET,
        Key: key
    });
    return (0, s3_request_presigner_1.getSignedUrl)(s3_config_1.default, command, { expiresIn });
}
