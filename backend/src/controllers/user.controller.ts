import { Request, Response, NextFunction } from "express";
import { IUserService }from "../services/interface/IUserService";
import { HttpStatus } from "../constants/status.constants";
import { createHttpError } from "../utils/httpError.util";
import { HttpResponse } from "../constants/responseMessage.constant";
import { clientUpdateSchema, freelancerUpdateSchema } from "schema/profile.schema";
import { sendResponse } from "utils/response.util";
import { IUser } from "types/user.type";


export class ProfileController {
    constructor(private _userService: IUserService){}

    async getMe(req: Request, res:Response, next: NextFunction) : Promise<void> {
        try {
            if(!req.user || !req.user._id){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.USER_NOT_FOUND);
            }

            const userId = req.user._id;

            const user = await this._userService.getMyProfile(userId);
        
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
            
            const user = await this._userService.updateProfile(userId, result.data as Partial<IUser>);
            
            sendResponse(res, HttpStatus.OK, { user });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res:Response, next: NextFunction) {
        try {
            const { id } = req.params

            const user = await this._userService.getUserProfileById(id);
            
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

            const users = await this._userService.getAllUsers(search, page, limit);
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

            const { profileImage } = await this._userService.setProfileImage(req.user?._id, req.file);

            sendResponse(res, HttpStatus.OK, { profileImage });
        } catch (error) {
            next(error);
        }
    }

    async removeProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if(!req.user){
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.USER_NOT_FOUND);
            }

            const { profileImage } = await this._userService.removeProfileImage(req.user._id);

            sendResponse(res, HttpStatus.OK, { profileImage });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            const { status } = req.body;

            if(!status) throw createHttpError(HttpStatus.BAD_REQUEST,'Status field is required');

            const user = await this._userService.changeUserStatus(userId, status);

            sendResponse(res, HttpStatus.OK, { user });
        } catch (error) {
            next(error);
        }
    }

    async getFreelancers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const search = req.query.search as string || "";

            //for infinite scroll
            const cursor = req.query.cursor as string | "";
            const limit = parseInt(req.query.limit as string) || 20;

            const clientId = req.user?._id;
            if(!clientId){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }

            const { freelancers, nextCursor } = await this._userService.getFreelancers(
                clientId, search, limit, cursor
            );

            sendResponse(res, HttpStatus.OK, { freelancers, nextCursor });
        } catch (error) {
            next(error);
        }
    }

    async getInterestedFreelancer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const clientId = req.user?._id;
            if(!clientId){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
            }
            const search = req.query.search as string || "";
            //for infinite scroll
            const cursor = req.query.cursor as string | undefined;
            const limit = parseInt(req.query.limit as string) || 20;

            const { freelancers, nextCursor } = await this._userService.getInterestedFreelancers(
                clientId, search, limit, cursor
            );

            sendResponse(res, HttpStatus.OK, { freelancers, nextCursor });
        } catch (error) {
            next(error);
        }
    }

    async addFreelancerInterest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const clientId = req.user?._id;
            const freelancerId = req.params.freelancerId;
            if(!clientId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }
            await this._userService.addFreelancerInterest(clientId, freelancerId);
            sendResponse(res, HttpStatus.OK, {}, "Interested freelancer added");
        } catch (error) {
            next(error);
        }
    }

    async removeFreelancerInterest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const clientId = req.user?._id;
            const freelancerId = req.params.freelancerId;
            if(!clientId) {
                throw createHttpError(HttpStatus.UNAUTHORIZED,HttpResponse.UNAUTHORIZED);
            }

            await this._userService.removeFreelancerInterest(clientId, freelancerId);
            sendResponse(res, HttpStatus.OK, {}, "Interested freelancer status updated");
        } catch (error) {
            next(error);
        }
    }
}