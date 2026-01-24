import { IMessageDocument } from "types/message.type";
import { BaseRepository } from "./base.repository";
import { IMessageRepository } from "./interfaces/IMessageRepository";
import messageModel from "models/message.model";

export class MessageRepository 
   extends BaseRepository<IMessageDocument>
      implements IMessageRepository {
        
    constructor(){
        super(messageModel);
    }
}