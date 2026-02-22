import { UserRole } from "../../constants/user.constants";
import { ClarificationBoardDto } from "../../dtos/clarificationBoard.dto";
import { ClarificationMessageDto } from "../../dtos/clarificationMessage.dto";

export interface IClarificationService {
    addMessage(
        jobId: string, 
        senderId: string, 
        senderRole: UserRole, 
        message: string
    ): Promise<ClarificationMessageDto>;
    getBoard(jobId: string): Promise<{ 
        board: ClarificationBoardDto, messages: ClarificationMessageDto[] 
    }>;
    closeBoard(jobId: string, requesterId: string): Promise<ClarificationBoardDto>;
}