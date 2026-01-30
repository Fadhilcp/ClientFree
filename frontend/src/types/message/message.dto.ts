export type MessageTypeDTO =
  | "text"
  | "file"
  | "voice"
  | "video_call"
  | "voice_call";

export type CallTypeDTO = "voice" | "video";

export type CallStatusDTO =
  | "missed"
  | "completed"
  | "declined";

export interface MessageFileDTO {
  name?: string;
  key?: string;
  size?: number;
  type?: string;
  url?: string;
}

export interface MessageVoiceDto {
  url?: string;
  duration?: number;
}

export interface MessageCallDetailsDTO {
  callType?: CallTypeDTO;
  callStart?: string;
  callEnd?: string;
  callStatus?: CallStatusDTO;
}

export interface MessageDTO {
  id: string;

  chatId: string;
  senderId: string;

  type: MessageTypeDTO;

  content?: string;
  file?: MessageFileDTO;
  callDetails?: MessageCallDetailsDTO;
  voice?: MessageVoiceDto;

  isReadBy: string[];
  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}
