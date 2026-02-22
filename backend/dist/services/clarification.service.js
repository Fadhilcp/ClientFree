"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClarificationService = void 0;
const httpError_util_1 = require("../utils/httpError.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const clarificationBoard_mapper_1 = require("../mappers/clarificationBoard.mapper");
const clarificationMessage_mapper_1 = require("../mappers/clarificationMessage.mapper");
const user_constants_1 = require("../constants/user.constants");
class ClarificationService {
    constructor(_clarificationBoardRepository, _clarificationMessageRepository, _jobRepository) {
        this._clarificationBoardRepository = _clarificationBoardRepository;
        this._clarificationMessageRepository = _clarificationMessageRepository;
        this._jobRepository = _jobRepository;
    }
    async addMessage(jobId, senderId, senderRole, message) {
        if (senderRole !== user_constants_1.UserRole.CLIENT && senderRole !== user_constants_1.UserRole.FREELANCER) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.ACCESS_DENIED);
        }
        const board = await this._clarificationBoardRepository.findOne({ jobId });
        if (!board)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.CLARIFICATION_BOARD_NOT_FOUND);
        if (board.status === "closed") {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.CLARIFICATION_BOARD_CLOSED);
        }
        const createdMesssage = await this._clarificationMessageRepository.createAndPopulate({
            boardId: board._id,
            senderId,
            senderRole,
            message,
        });
        // to check message created or not(because of createAndPopulate maybe return null)
        if (!createdMesssage) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR, "Clarification message create failed");
        }
        return (0, clarificationMessage_mapper_1.mapClarificationMessage)(createdMesssage);
    }
    async getBoard(jobId) {
        const board = await this._clarificationBoardRepository.findOne({ jobId });
        if (!board) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.CLARIFICATION_BOARD_NOT_FOUND);
        }
        const messages = await this._clarificationMessageRepository.findSortedMessages({ boardId: board._id });
        return { board: (0, clarificationBoard_mapper_1.mapClarificationBoard)(board), messages: messages.map(clarificationMessage_mapper_1.mapClarificationMessage) };
    }
    async closeBoard(jobId, requesterId) {
        const job = await this._jobRepository.findById(jobId);
        if (!job)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.JOB_NOT_FOUND);
        if (job.clientId.toString() !== requesterId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "Only job owner can close clarification");
        }
        const board = await this._clarificationBoardRepository.findOne({ jobId });
        if (!board) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.CLARIFICATION_BOARD_NOT_FOUND);
        }
        board.status = "closed";
        await board.save();
        return (0, clarificationBoard_mapper_1.mapClarificationBoard)(board);
    }
}
exports.ClarificationService = ClarificationService;
