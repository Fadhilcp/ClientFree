import { IMessageDocument } from "../types/message.type";
import { MessageDTO } from "../dtos/message.dto";

export class MessageMapper {
  static toDTO(message: IMessageDocument): MessageDTO {
    return {
      id: message._id.toString(),

      chatId: message.chatId.toString(),
      senderId: message.senderId.toString(),

      type: message.type,

      content: message.content,

      file: message.file
        ? {
            fileName: message.file.FileName,
            fileSize: message.file.FileSize,
            fileType: message.file.FileType,
            fileUrl: message.file.FileUrl,
          }
        : undefined,

      callDetails: message.callDetails
        ? {
            callType: message.callDetails.callType,
            callStart: message.callDetails.callStart?.toISOString(),
            callEnd: message.callDetails.callEnd?.toISOString(),
            callStatus: message.callDetails.callStatus,
          }
        : undefined,

      isReadBy: message.isReadBy.map(id => id.toString()),
      isDeleted: message.isDeleted,

      createdAt: message.createdAt?.toISOString() ?? "",
      updatedAt: message.updatedAt?.toISOString() ?? "",
    };
  }

  static toDTOList(messages: IMessageDocument[]): MessageDTO[] {
    return messages.map(this.toDTO);
  }
}
