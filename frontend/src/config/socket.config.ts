import { io } from "socket.io-client";
import { env } from "./env";

export const socket = io(env.VITE_API_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});