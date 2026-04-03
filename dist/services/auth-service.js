import jwt from "jsonwebtoken";
import { AppError } from "../error/appError.js";
import { prisma } from "../lib/prisma.js";
import { consoleError } from "../error/displayConsoleError.js";
import crypto from "crypto";
export const checkRefreshToken = (refreshToken) => {
    try {
        const decodedToken = jwt.verify(refreshToken, process.env.SECRET_KEY);
        return decodedToken;
    }
    catch (error) {
        consoleError("checkRefreshToken", error);
        throw new AppError("Internal Server Error!", 500);
    }
};
export const checkAccessToken = (sessionToken) => {
    try {
        const decodedToken = jwt.verify(sessionToken, process.env.JWT_SECRET);
        return decodedToken;
    }
    catch (error) {
        consoleError("checkAccessToken", error);
        throw new AppError("Internal Server Error!", 500);
    }
};
export const createRefreshToken = (id) => {
    try {
        const jwtOptions = {
            expiresIn: "7d",
            issuer: "myapp",
            audience: "users",
            subject: `${id}`,
        };
        const token = jwt.sign({ id }, process.env.JWT_SECRET, jwtOptions);
        return token;
    }
    catch (error) {
        consoleError("createRefreshToken", error);
        throw new AppError("Internal Server Error!", 500);
    }
};
export const createAccessToken = (id, name, email) => {
    try {
        const jwtOptions = {
            expiresIn: "1h",
            issuer: "myapp",
            audience: "users",
            subject: `${id}`,
        };
        const token = jwt.sign({ id, name, email }, process.env.JWT_SECRET, jwtOptions);
        return token;
    }
    catch (error) {
        consoleError("createAccessToken", error);
        throw new AppError("Internal Server Error!", 500);
    }
};
export const createTokens = (res, userId, name, email) => {
    try {
        const refreshToken = createRefreshToken(userId);
        const refreshCookieOptions = {
            maxAge: (7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: "strict",
        };
        const accessToken = createAccessToken(userId, name, email);
        const accessCookieOptions = {
            maxAge: (60 * 60 * 1000),
            httpOnly: true,
            sameSite: "strict",
        };
        res.cookie("acccess_token", accessToken, accessCookieOptions);
        res.cookie("refresh_token", refreshToken, refreshCookieOptions);
    }
    catch (error) {
        consoleError("createToken", error);
        throw new AppError("Internal Server Error", 500);
    }
};
export const createOtp = async (email) => {
    try {
        const otpCode = crypto.randomInt(100000, 1000000).toString();
        console.log("otpCode", otpCode);
        await prisma.otps.create({
            data: {
                otpCode,
                email,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), //10 minutes expiry
            },
        });
        return otpCode;
    }
    catch (error) {
        consoleError("createOtp", error);
        throw new AppError("Internal Server Error", 500);
    }
};
export const verifyOtp = async (email, otp) => {
    try {
        const otpCode = await prisma.otps.findFirst({
            where: {
                email,
                otpCode: otp,
            },
        });
        return otpCode;
    }
    catch (error) {
        consoleError("verifyOtp", error);
        throw new AppError("Internal Server Error", 500);
    }
};
