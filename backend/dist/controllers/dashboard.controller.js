"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashBoardController = void 0;
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const status_constants_1 = require("../constants/status.constants");
const httpError_util_1 = require("../utils/httpError.util");
const response_util_1 = require("../utils/response.util");
const user_constants_1 = require("../constants/user.constants");
class DashBoardController {
    constructor(_clientDashboardService, _freelancerDashboardService) {
        this._clientDashboardService = _clientDashboardService;
        this._freelancerDashboardService = _freelancerDashboardService;
    }
    ;
    async getClientPaymentOverview(req, res, next) {
        try {
            const userId = req.user?._id;
            const role = req.user?.role;
            if (!userId)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.UNAUTHORIZED);
            const service = role === user_constants_1.UserRole.CLIENT ? this._clientDashboardService : this._freelancerDashboardService;
            const overview = await service.getPaymentOverview(userId);
            (0, response_util_1.sendResponse)(res, status_constants_1.HttpStatus.OK, { overview });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashBoardController = DashBoardController;
