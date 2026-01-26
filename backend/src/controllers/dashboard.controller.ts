import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { ClientPaymentOverviewDTO, FreelancerPaymentOverviewDTO } from "../dtos/paymentOverview.dto";
import { NextFunction, Request, Response } from "express";
import { IDashBoardOverviewService } from "../services/interface/IDashboardService";
import { createHttpError } from "../utils/httpError.util";
import { sendResponse } from "../utils/response.util";
import { UserRole } from "constants/user.constants";

export class DashBoardController {

    constructor(
        private _clientDashboardService: IDashBoardOverviewService<ClientPaymentOverviewDTO>,
        private _freelancerDashboardService: IDashBoardOverviewService<FreelancerPaymentOverviewDTO>,
    ){};

    async getClientPaymentOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            const role = req.user?.role

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const service = role === UserRole.CLIENT ? this._clientDashboardService : this._freelancerDashboardService;

            const overview = await service.getPaymentOverview(userId);

            sendResponse(res, HttpStatus.OK, { overview });
        } catch (error) {
            next(error);
        }
    }
}