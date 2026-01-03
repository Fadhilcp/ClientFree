import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { IWalletService } from "services/interface/IWalletService";
import { createHttpError } from "utils/httpError.util";
import { sendResponse } from "utils/response.util";

export class WalletController {
    constructor(private _walletService: IWalletService){};

    async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const data = await this._walletService.getWalletDetails(userId, page, limit);

            sendResponse(res, HttpStatus.OK, data );
        } catch (error) {
            next(error);
        }
    }

    async getEscrowDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const data = await this._walletService.getEscrowDetails(userId, page, limit);

            sendResponse(res, HttpStatus.OK, data );
        } catch (error) {
            next(error);
        }
    }

    async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const data = await this._walletService.getTransactions(userId, page, limit);

            sendResponse(res, HttpStatus.OK, data );
        } catch (error) {
            next(error);
        }
    }

    async getInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const data = await this._walletService.getInvoices(userId, page, limit);

            sendResponse(res, HttpStatus.OK, data);
        } catch (error) {
            next(error);
        }
    }

    async downloadInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;

            const { transactionId } = req.params;

            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const pdfBuffer = await this._walletService.downloadInvoicePdf(userId, transactionId);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=invoice-${transactionId}.pdf`
            );
            res.setHeader("Content-Length", pdfBuffer.length);

            res.status(HttpStatus.OK).send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }

    async getFinancialReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            if(!userId) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);

            const fromRaw = req.query.from;
            const toRaw = req.query.to;

            if (!fromRaw || !toRaw) {
                throw createHttpError(
                    HttpStatus.BAD_REQUEST,
                    "from and to dates are required"
                );
            }

            const from = new Date(fromRaw as string);
            const to = new Date(toRaw as string);

            if (isNaN(from.getTime()) || isNaN(to.getTime())) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid date format");
            }

            const report = await this._walletService.getFinancialReport(userId, new Date(from), new Date(to));

            sendResponse(res, HttpStatus.OK, { report });
        } catch (error) {
            next(error);
        }
    }

    async getAllUserWallets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const wallets = await this._walletService.getAllUserWallets(search, page, limit);

            sendResponse(res, HttpStatus.OK, { wallets });
        } catch (error) {
            next(error);
        }
    }


    async getAllUserWalletTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { walletId } = req.params;

            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const transactions = await this._walletService.getUserWalletTransactions(walletId, search, page, limit);

            sendResponse(res, HttpStatus.OK, { transactions });
        } catch (error) {
            next(error);
        }
    }
}