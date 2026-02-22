"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const env_config_1 = require("./config/env.config");
const socket_config_1 = require("./config/socket.config");
const server = http_1.default.createServer(app_1.default);
(0, socket_config_1.initSocket)(server);
const PORT = env_config_1.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server is running at ${env_config_1.env.PORT} port`);
});
