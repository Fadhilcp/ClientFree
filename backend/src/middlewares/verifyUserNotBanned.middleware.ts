import { HttpResponse } from "../constants/responseMessage.constant";
import { HttpStatus } from "../constants/status.constants";
import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/user.repository";
import { createHttpError } from "../utils/httpError.util";

const userRepository = new UserRepository();

export const verifyUserNotBanned = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?._id) {
    throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
  }

  try {
    const user = await userRepository.findStatusById(req.user._id);

    if (!user) {
      throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
    }

    if (user.status === "banned") {
      throw createHttpError(HttpStatus.FORBIDDEN, "Your account is banned")
    }

    next();
  } catch (error) {
    next(error);
  }
};