import { Request, Response, NextFunction } from "express";
import { IUserService }from "../services/interface/IUserService";
import { HttpStatus } from "../constants/status.constants";
import { createHttpError } from "../utils/httpError.util";
import { HttpResponse } from "../constants/responseMessage.constant";
import { clientUpdateSchema, freelancerUpdateSchema } from "schema/profile.schema";
import { sendResponse } from "utils/response.util";
import { IUser } from "types/user.type";


export class ProfileController {

    constructor(private service: IUserService){}

    async getMe(req: Request, res:Response, next: NextFunction) : Promise<void> {
        try {
            if(!req.user || !req.user._id){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.USER_NOT_FOUND);
            }

            const userId = req.user._id;
   
            const user = await this.service.getMyProfile(userId);
            
            sendResponse(res, HttpStatus.OK, { user });
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
            
            const user = await this.service.updateProfile(userId, result.data as Partial<IUser>);
            
            sendResponse(res, HttpStatus.OK, { user });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res:Response, next: NextFunction) {
        try {
            const { id } = req.params

            const user = await this.service.getUserProfileById(id);
            
            sendResponse(res, HttpStatus.OK, { user });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res:Response, next:NextFunction) : Promise<void> {
        try {
            const search = req.query.search as string || '';
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const users = await this.service.getAllUsers(search, page, limit);
            sendResponse(res, HttpStatus.OK, { users });
        } catch (error) {
            next(error);
        }
    }

    async  setProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if(!req.user){
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.USER_NOT_FOUND);
            }
            if(!req.file) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.NO_FILE_FOUND);
            }

            const { profileImage } = await this.service.setProfileImage(req.user?._id, req.file);

            sendResponse(res, HttpStatus.OK, { profileImage });
        } catch (error) {
            next(error);
        }  
    }

    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            const { status } = req.body;
            console.log("🚀 ~ ProfileController ~ updateStatus ~ status:", status)

            if(!status) throw createHttpError(HttpStatus.BAD_REQUEST,'Status field is required');

            const user = await this.service.changeUserStatus(userId, status);

            sendResponse(res, HttpStatus.OK, { user });
        } catch (error) {
            next(error);
        }
    }
}