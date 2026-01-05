import { ClarificationBoardDto } from "../dtos/clarificationBoard.dto";
import { IClarificationBoardDocument } from "../types/clarificationBoard";

export function mapClarificationBoard(
  board: IClarificationBoardDocument
): ClarificationBoardDto {
  return {
    id: board._id.toString(),
    jobId: board.jobId.toString(),

    status: board.status,
    messageCount: board.messageCount,

    lastMessageAt: board.lastMessageAt
      ? board.lastMessageAt.toISOString()
      : null,

    isDeleted: board.isDeleted,
    deletedAt: board.deletedAt ? board.deletedAt.toISOString() : null,

    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
  };
}