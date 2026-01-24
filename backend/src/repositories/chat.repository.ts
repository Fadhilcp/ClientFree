import { IChatDocument } from "types/chat.type";
import { BaseRepository } from "./base.repository";
import { IChatRepository } from "./interfaces/IChatRepository";
import chatModel from "models/chat.model";

export class ChatRepository 
   extends BaseRepository<IChatDocument>
      implements IChatRepository {
        
    constructor(){
        super(chatModel);
    }
}