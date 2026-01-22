import http from "http";
import app from "./app";
import { env } from "./config/env.config";
import { initSocket } from "./config/socket.config";

const server = http.createServer(app);

initSocket(server);

const PORT = env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server is running at ${env.PORT} port`);
});