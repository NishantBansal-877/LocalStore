import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { AppError } from "../error/appError.js";
import type { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { consoleError } from "../error/displayConsoleError.js";
import crypto from "crypto";
export const checkRefreshToken = (
  refreshToken: string,
): JwtPayload | string => {
  try {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.SECRET_KEY as string,
    );
    return decodedToken;
  } catch (error) {
    consoleError("checkRefreshToken", error);
    throw new AppError("Internal Server Error!", 500);
  }
};

export const checkAccessToken = (sessionToken: string): string | JwtPayload => {
  try {
    const decodedToken: string | JwtPayload = jwt.verify(
      sessionToken,
      process.env.JWT_SECRET as string,
    );
    return decodedToken;
  } catch (error) {
    consoleError("checkAccessToken", error);
    throw new AppError("Internal Server Error!", 500);
  }
};

export const createRefreshToken = (id: string): string => {
  try {
    const jwtOptions: object = {
      expiresIn: "7d",
      issuer: "myapp",
      audience: "users",
      subject: `${id}`,
    };

    const token = jwt.sign(
      { id },
      process.env.JWT_SECRET as string,
      jwtOptions,
    );
    return token;
  } catch (error) {
    consoleError("createRefreshToken", error);
    throw new AppError("Internal Server Error!", 500);
  }
};

export const createAccessToken = (
  id: string,
  name: string,
  email: string,
): string => {
  try {
    const jwtOptions: object = {
      expiresIn: "1h",
      issuer: "myapp",
      audience: "users",
      subject: `${id}`,
    };

    const token = jwt.sign(
      { id, name, email },
      process.env.JWT_SECRET as string,
      jwtOptions,
    );
    return token;
  } catch (error) {
    consoleError("createAccessToken", error);
    throw new AppError("Internal Server Error!", 500);
  }
};

export const createTokens = (
  res: Response,
  userId: string,
  name: string,
  email: string,
): void => {
  try {
    const refreshToken = createRefreshToken(userId!);

    const refreshCookieOptions: object = {
      maxAge: (7 * 24 * 60 * 60 * 1000) as number,
      httpOnly: true as boolean,
      sameSite: "strict" as string,
    };

    const accessToken = createAccessToken(userId, name, email);

    const accessCookieOptions: object = {
      maxAge: (60 * 60 * 1000) as number,
      httpOnly: true as boolean,
      sameSite: "strict" as string,
    };

    res.cookie("acccess_token", accessToken, accessCookieOptions);

    res.cookie("refresh_token", refreshToken, refreshCookieOptions);
  } catch (error) {
    consoleError("createToken", error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const createOtp = async (email: string): Promise<string> => {
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
  } catch (error) {
    consoleError("createOtp", error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const otpCode = await prisma.otps.findFirst({
      where: {
        email,
        otpCode: otp,
      },
    });

    return otpCode;
  } catch (error) {
    consoleError("verifyOtp", error);
    throw new AppError("Internal Server Error", 500);
  }
};
