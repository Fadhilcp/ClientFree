"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageMapper = void 0;
class MessageMapper {
    static toDTO(message) {
        return {
            id: message._id.toString(),
            chatId: message.chatId.toString(),
            senderId: message.senderId.toString(),
            type: message.type,
            content: message.content,
            file: message.file
                ? {
                    name: message.file.name,
                    key: message.file.key,
                    size: message.file.size,
                    type: message.file.type,
                    url: message.file.url,
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
            voice: message.voice
                ? {
                    url: message.voice.url,
                    duration: message.voice.duration,
                }
                : undefined,
            isReadBy: message.isReadBy.map(id => id.toString()),
            isDeleted: message.isDeleted,
            deletedAt: message.deletedAt,
            createdAt: message.createdAt?.toISOString() ?? "",
            updatedAt: message.updatedAt?.toISOString() ?? "",
        };
    }
    static toDTOList(messages) {
        return messages.map(this.toDTO);
    }
}
exports.MessageMapper = MessageMapper;
