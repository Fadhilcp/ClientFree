import { IClarificationBoardRepository } from "repositories/interfaces/IClarificationBoardRepository";
import { IClarificationService } from "./interface/IClarificationService";
import { IClarificationMessageRepository } from "repositories/interfaces/IClarificationMessageRepository";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import { IJobRepository } from "repositories/interfaces/IJobRepository";
import { ClarificationMessageDto } from "dtos/clarificationMessage.dto";
import { ClarificationBoardDto } from "dtos/clarificationBoard.dto";
import { mapClarificationBoard } from "mappers/clarificationBoard.mapper";
import { mapClarificationMessage } from "mappers/clarificationMessage.mapper";

export class ClarificationService implements IClarificationService {

    constructor(
        private _clarificationBoardRepository: IClarificationBoardRepository,
        private _clarificationMessageRepository: IClarificationMessageRepository,
        private _jobRepository: IJobRepository,
    ){}

    async addMessage(
        jobId: string, senderId: string, senderRole: "client" | "freelancer", message: string
    ): Promise<ClarificationMessageDto> {
        
        const board = await this._clarificationBoardRepository.findOne({ jobId });
        if(!board) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CLARIFICATION_BOARD_NOT_FOUND);

        if(board.status === "closed") {
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.CLARIFICATION_BOARD_CLOSED);
        }

        const createdMesssage = await this._clarificationMessageRepository.createAndPopulate({
            boardId: board._id,
            senderId,
            senderRole,
            message,
        })
        // to check message created or not(because of createAndPopulate maybe return null)
        if(!createdMesssage) {
            throw createHttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Clarification message create failed"
            )
        }

        return mapClarificationMessage(createdMesssage);
    }

    async getBoard(jobId: string): Promise<{ board: ClarificationBoardDto; messages: ClarificationMessageDto[]; }> {
        
        const board = await this._clarificationBoardRepository.findOne({ jobId });
        if(!board){
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CLARIFICATION_BOARD_NOT_FOUND);
        }
        const messages = await this._clarificationMessageRepository.findSortedMessages({ boardId: board._id });

        return { board: mapClarificationBoard(board), messages: messages.map(mapClarificationMessage) };
    }

    async closeBoard(jobId: string, requesterId: string): Promise<ClarificationBoardDto> {
        
        const job = await this._jobRepository.findById(jobId);
        if(!job) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.JOB_NOT_FOUND);

        if(job.clientId.toString() !== requesterId){
            throw createHttpError(HttpStatus.FORBIDDEN, "Only job owner can close clarification");
        }

        const board = await this._clarificationBoardRepository.findOne({ jobId });
        if(!board) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.CLARIFICATION_BOARD_NOT_FOUND);
        }
        board.status = "closed";
        await board.save();

        return mapClarificationBoard(board);
    }
}