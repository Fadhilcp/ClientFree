import { IChatDocument } from "../types/chat.type";
import { IUserDocument } from "../types/user.type";
import { IJobDocument } from "../types/job.type";
import { ChatDTO } from "../dtos/chat.dto";
import { ChatListDTO } from "../dtos/chat.dto";

export class ChatMapper {

  static toDTO(chat: IChatDocument): ChatDTO {
    return {
      id: chat._id.toString(),
      jobId: chat.jobId ? chat.jobId.toString() : null,
      participants: chat.participants.map(p => p.toString()),
      status: chat.status,
      isBlocked: chat.isBlocked,
      blockReason: chat.blockReason ?? null,
      lastMessageAt: chat.lastMessageAt?.toISOString(),
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    };
  }

  static toListDTO(
    chat: IChatDocument,
    currentUserId: string
  ): ChatListDTO {
    const participants = chat.participants as unknown as IUserDocument[];

    const otherUser = participants.find(
      p => p._id.toString() !== currentUserId
    );

    if (!otherUser) {
      throw new Error("ChatMapper: otherUser not found");
    }

    const job = chat.jobId
      ? (chat.jobId as unknown as IJobDocument)
      : null;

    return {
      id: chat._id.toString(),

      job: job
        ? {
            id: job._id.toString(),
            title: job.title,
            status: job.status,
          }
        : null,

      otherUser: {
        id: otherUser._id.toString(),
        name: otherUser.name ?? "",
        username: otherUser.username,
        profileImage: otherUser.profileImage ?? "",
        role: otherUser.role,
        isVerified: otherUser.isVerified ?? false,
      },

      status: chat.status,

      isBlocked: chat.isBlocked,
      blockReason: chat.blockReason ?? null,

      lastMessageAt: chat.lastMessageAt?.toISOString(),

      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    };
  }

  static toListDTOList(
    chats: IChatDocument[],
    currentUserId: string
  ): ChatListDTO[] {
    return chats.map(chat =>
      this.toListDTO(chat, currentUserId)
    );
  }
}
