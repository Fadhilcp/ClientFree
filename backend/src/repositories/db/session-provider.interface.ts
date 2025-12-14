import { ClientSession } from "mongoose";

export interface IDatabaseSessionProvider {
  startSession(): Promise<ClientSession>;
}