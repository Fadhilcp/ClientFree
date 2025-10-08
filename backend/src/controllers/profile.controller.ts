import { Request, Response, NextFunction } from "express";
import { IProfileService } from "../services/interface/IProfileService";
import { HttpStatus } from "../constants/status.constants";
import { createHttpError } from "../utils/httpError.util";
import { HttpResponse } from "../constants/responseMessage.constant";
import { clientUpdateSchema, freelancerUpdateSchema } from "schema/profile.schema";
import { sendResponse } from "utils/response.util";


export class ProfileController {

    constructor(private service: IProfileService){}

    async getMe(req: Request, res:Response, next: NextFunction) : Promise<void> {
        try {
            if(!req.user || !req.user._id){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.USER_NOT_FOUND);
            }

            const userId = req.user._id;
   
            const profile = await this.service.getMyProfile(userId);
            
            sendResponse(res, HttpStatus.OK, { profile });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction ) : Promise<void> {
        try {
            if(!req.user || !req.user._id){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.USER_NOT_FOUND);
            }
            const userId = req.user?._id;
            const schema = req.user.role === 'freelancer' ? freelancerUpdateSchema : clientUpdateSchema;

            const result = schema.safeParse(req.body)
            if(!result.success){
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.INVALID_CREDENTIALS);
            }
            
            const profile = await this.service.updateProfile(userId, result.data);
            
            sendResponse(res, HttpStatus.OK, { profile });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res:Response, next: NextFunction) {
        try {
            const { id } = req.params

            const profile = await this.service.getUserProfileById(id);
            
            sendResponse(res, HttpStatus.OK, { profile });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res:Response, next:NextFunction) : Promise<void> {
        try {
            const users = await this.service.getAllUsers();
            sendResponse(res, HttpStatus.OK, { users });
        } catch (error) {
            next(error);
        }
    }

}