import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { Request, Response, NextFunction } from "express";
import { createHttpError } from "../utils/httpError.util";
import { UserRole } from "constants/user.constants";

export const authorizeRole =
  (...allowedRoles: UserRole[]) =>

  (req: Request, _res: Response, next: NextFunction) => {

    if (!req.user) {
      return next(createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ACCESS_DENIED));
    }

    next();
};
