import { Response } from "express";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: T,
  message = '',
  success = true
) => {
    res.status(statusCode).json({
      success,
      message,
      ...payload,
    });
};