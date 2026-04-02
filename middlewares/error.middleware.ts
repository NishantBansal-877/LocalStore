import type { Request, Response, NextFunction } from "express";
import { AppError } from "../error/appError";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let statusCode: number = 500;
  let message: string = "Internal Server Error!";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  res.status(500).json({
    success: false,
    message,
    statusCode,
  });
};
