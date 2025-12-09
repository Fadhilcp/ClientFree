import { ClarificationMessageDto } from "dtos/clarificationMessage.dto";
import { IClarificationMessageDocument } from "types/clarificationMessage";
import { IUserDocument } from "types/user.type";
export function mapClarificationMessage(
  msg: IClarificationMessageDocument
): ClarificationMessageDto {
const senderObj = msg.senderId as unknown as Partial<IUserDocument>;
  return {
    id: msg._id.toString(),
    boardId: msg.boardId.toString(),

    sender: {
        id: senderObj._id
            ? senderObj._id.toString() 
            : msg.senderId.toString(),
        username: senderObj.username ?? "",
        name: senderObj.name ?? "",
        email: senderObj.email ?? "",
        profileImage: senderObj.profileImage ?? null,
        role: senderObj.role ?? "",
    },
    senderRole: msg.senderRole,

    message: msg.message,

    isDeleted: msg.isDeleted,
    deletedAt: msg.deletedAt ? msg.deletedAt.toISOString() : null,

    sentAt: msg.sentAt ? msg.sentAt.toISOString() : null,

    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.updatedAt.toISOString(),
  };
}
