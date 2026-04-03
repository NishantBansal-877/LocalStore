import { AppError } from "../error/appError.js";
export const errorMiddleware = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Internal Server Error!";
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
