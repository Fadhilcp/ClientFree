import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { createHttpError } from "../utils/httpError.util";
import { sendResponse } from "../utils/response.util";
import { INotificationService } from "../services/interface/INotificationService";

export class NotificationController {
    constructor(private _notificationService: INotificationService){};

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            // const userId = req.user?._id;

            // if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const notification = await this._notificationService.createNotification({
                ...req.body,
                createdBy: '69443da6b922675b3edcb6b9',
            });
            
            sendResponse(res, HttpStatus.CREATED, { notification });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { notificationId } = req.params;
    
            const notification = await this._notificationService.updateNotification(
                notificationId,
                req.body,
            );
            
            sendResponse(res, HttpStatus.OK, { notification });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { notificationId } = req.params;

            await this._notificationService.deleteNotification(notificationId);

            sendResponse(res, HttpStatus.OK, {}, "Notification deleted");
        } catch (error) {
            next(error);
        }
    }

    async getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const userId = req.user?._id;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const notifications = await this._notificationService.getUserNotifications(userId, page, limit);

            sendResponse(res, HttpStatus.OK, { notifications });
        } catch (error) {
            next(error);
        }
    }

    async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const { notificationId } = req.params;
            const userId = req.user?._id;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const notification = await this._notificationService.markAsRead(notificationId, userId);

            sendResponse(res, HttpStatus.OK, { notification });
        } catch (error) {
            next(error);
        }
    }
    
    async countUnread(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const unreadCount = await this._notificationService.countUnread(userId);

            sendResponse(res, HttpStatus.OK, { unreadCount });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const { modifiedCount } = await this._notificationService.markAllAsRead(userId);

            sendResponse(res, HttpStatus.OK, { modifiedCount });
        } catch (error) {
            next(error);
        }
    }

    async getAdminNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const search = req.query.search as string || '';
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const notifications = await this._notificationService.getAdminNotifications(search, page, limit);

            sendResponse(res, HttpStatus.OK, { notifications });
        } catch (error) {
            next(error);
        }
    }
}
