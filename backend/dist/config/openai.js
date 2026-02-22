"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_1 = __importDefault(require("openai"));
const env_config_1 = require("./env.config");
exports.openai = new openai_1.default({
    apiKey: env_config_1.env.OPENAI_API_KEY,
});
