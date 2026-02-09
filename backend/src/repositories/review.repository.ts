import { IReviewDocument } from "../types/review.type";
import reviewModel from "../models/review.model";
import { BaseRepository } from "./base.repository";
import { IReviewRepository } from "./interfaces/IReviewRepository";

export class ReviewRepository 
   extends BaseRepository<IReviewDocument>
      implements  IReviewRepository {
        
    constructor(){
        super(reviewModel);
    }
}