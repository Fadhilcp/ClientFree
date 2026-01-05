import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { NextFunction, Request, Response } from "express";
import { createHttpError } from "../utils/httpError.util";

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    throw createHttpError(HttpStatus.CREATED,HttpResponse.ACCESS_DENIED);
  }
  next();
};