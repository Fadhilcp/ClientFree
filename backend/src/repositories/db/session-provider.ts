import mongoose, { ClientSession } from "mongoose";
import { IDatabaseSessionProvider } from "./session-provider.interface";

export class MongooseSessionProvider implements IDatabaseSessionProvider {
  async startSession(): Promise<ClientSession> {
    return mongoose.startSession();
  }

  async runInTransaction<T>(callback: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await this.startSession();
    session.startTransaction();

    try {
      const result = await callback(session);
      await session.commitTransaction();
      session.endSession();
      return result;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
}
