import { ClarificationBoardDto } from "dtos/clarificationBoard.dto";
import { ClarificationMessageDto } from "dtos/clarificationMessage.dto";
import { IClarificationBoardDocument } from "types/clarificationBoard";
import { IClarificationMessageDocument } from "types/clarificationMessage";

export interface IClarificationService {
    addMessage(
        jobId: string, 
        senderId: string, 
        senderRole: "client" | "freelancer", 
        message: string
    ): Promise<ClarificationMessageDto>;
    getBoard(jobId: string): Promise<{ 
        board: ClarificationBoardDto, messages: ClarificationMessageDto[] 
    }>;
    closeBoard(jobId: string, requesterId: string): Promise<ClarificationBoardDto>;
}