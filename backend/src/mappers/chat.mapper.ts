import { IChatDocument } from "../types/chat.type";
import { ChatDTO } from "../dtos/chat.dto";

export class ChatMapper {
  static toDTO(chat: IChatDocument): ChatDTO {
    return {
      id: chat._id.toString(),

      jobId: chat.jobId ? chat.jobId.toString() : null,

      participants: chat.participants.map(p => p.toString()),

      status: chat.status,
      blockReason: chat.blockReason ?? null,

      lastMessageAt: chat.lastMessageAt?.toISOString(),

      createdAt: chat.createdAt?.toISOString() ?? "",
      updatedAt: chat.updatedAt?.toISOString() ?? "",
    };
  }

  static toDTOList(chats: IChatDocument[]): ChatDTO[] {
    return chats.map(this.toDTO);
  }
}
