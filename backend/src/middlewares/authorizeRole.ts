import { HttpResponse } from "constants/responseMessage.constant";
import { HttpStatus } from "constants/status.constants";
import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

export const authorizeRole =
  (...allowedRoles: Array<"client" | "freelancer" | "admin">) =>

  (req: Request, _res: Response, next: NextFunction) => {

    if (!req.user) {
      return next(createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ACCESS_DENIED));
    }

    next();
};
