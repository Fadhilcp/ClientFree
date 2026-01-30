import { Document, Types } from "mongoose";

export type MessageType =
  | "text"
  | "file"
  | "voice"
  | "video_call"
  | "voice_call";

export type CallType = "voice" | "video";

export type CallStatus =
  | "missed"
  | "completed"
  | "declined";

export interface IMessageFile {
  name?: string;
  key?: string;
  size?: number;
  type?: string;
  url?: string;
}

export interface IMessageVoice {
  url?: string;
  duration?: number;
}

export interface IMessageCallDetails {
  callType?: CallType;
  callStart?: Date;
  callEnd?: Date;
  callStatus?: CallStatus;
}

export interface IMessage {
  chatId: Types.ObjectId | string;
  senderId: Types.ObjectId | string;

  type: MessageType;

  content?: string;

  file?: IMessageFile;

  voice?: IMessageVoice;

  callDetails?: IMessageCallDetails;

  isReadBy: (Types.ObjectId | string)[];

  isDeleted: boolean;
  deletedAt: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessageDocument extends IMessage, Document {
  _id: Types.ObjectId;
}
