import { IClarificationBoardDocument } from "../types/clarificationBoard";
import { BaseRepository } from "./base.repository";
import { IClarificationBoardRepository } from "./interfaces/IClarificationBoardRepository";
import clarificationBoardModel from "../models/clarificationBoard.model";

export class ClarificationBoardRepository 
   extends BaseRepository<IClarificationBoardDocument>
      implements IClarificationBoardRepository {
        
    constructor(){
        super(clarificationBoardModel);
    }
}