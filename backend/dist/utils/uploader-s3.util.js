"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const s3_config_1 = __importDefault(require("../config/s3.config"));
const env_config_1 = require("../config/env.config");
if (!env_config_1.env.AWS_BUCKET)
    throw new Error("AWS_BUCKET missing");
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3_config_1.default,
        bucket: env_config_1.env.AWS_BUCKET,
        acl: "private",
        metadata: (req, file, cb) => {
            cb(null, { filename: file.fieldname });
        },
        key: (req, file, cb) => {
            const uniqueName = `${Date.now().toString()}-${file.originalname}`;
            cb(null, uniqueName);
        }
    })
});
exports.default = upload;
