import { Request, Response, NextFunction } from "express";
import { IProfileService } from "../interfaces/services/IProfileService.js";
import { HttpStatus } from "../constants/status.constants.js";
import { createHttpError } from "../utils/httpError.util.js";
import { HttpResponse } from "../constants/responseMessage.constant.js";


export class ProfileController {

    constructor(private service: IProfileService){}

    async getMe(req: Request, res:Response, next: NextFunction) : Promise<void> {
        try {
            if(!req.user || !req.user._id){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.USER_NOT_FOUND);
            }

            const userId = req.user._id;
            const userHeader = req.headers['x-user-payload'];

            console.log("🚀 ~ ProfileController ~ getMe ~ userHeader:", userHeader)

        if (!userHeader) {
             res.status(401).json({ success: false, message: 'User info missing' });
            return
        }

        const user = JSON.parse(userHeader as string) as {
            _id: string;
            email: string;
            role: 'freelancer' | 'client' | 'admin';
        };
            const profile = await this.service.getMyProfile(user._id)
            
            res.status(HttpStatus.OK).json({ success : true, profile })
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction ) : Promise<void> {
        try {
    
            console.log("🚀 ~ ProfileController ~ update ~ body:", req.body)
            
            if(!req.user || !req.user._id){
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.USER_NOT_FOUND);
            }

            //not using here
            const userId = req.user?._id;

              const userHeader = req.headers['x-user-payload'];
              console.log("🚀 ~ ProfileController ~ update ~ userHeader:", userHeader)
            

        if (!userHeader) {
             res.status(401).json({ success: false, message: 'User info missing' });
            return
        }

        const user = JSON.parse(userHeader as string) as {
            _id: string;
            email: string;
            role: 'freelancer' | 'client' | 'admin';
        };
            console.log("🚀 ~ ProfileController ~ update ~ user:", user)
            
            const profile = await this.service.updateProfile(user._id, req.body);

            res.status(HttpStatus.OK).json({ success : true, profile });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res:Response, next: NextFunction) {
        try {
            const { id } = req.params

            const profile = await this.service.getUserProfileById(id);
            
            res.status(HttpStatus.OK).json({ success : true, profile });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res:Response, next:NextFunction) : Promise<void> {
        try {
            const users = await this.service.getAllUsers();
            res.status(HttpStatus.OK).json({ success: true, users });
        } catch (error) {
            next(error);
        }
    }

}