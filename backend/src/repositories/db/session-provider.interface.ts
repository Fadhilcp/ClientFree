import { ClientSession } from "mongoose";

export interface IDatabaseSessionProvider {
  startSession(): Promise<ClientSession>;
  runInTransaction<T>(
    callback: (session: ClientSession) => Promise<T>
  ): Promise<T>;
}