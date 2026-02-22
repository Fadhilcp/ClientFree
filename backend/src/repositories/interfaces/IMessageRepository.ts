import { IMessageDocument } from "../../types/message.type";
import { IBaseRepository } from "./IBaseRepository";

export type IMessageRepository = IBaseRepository<IMessageDocument>;