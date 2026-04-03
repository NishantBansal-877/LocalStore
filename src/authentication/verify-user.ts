import type { Request, Response, NextFunction } from "express";
import {
  checkAccessToken,
  checkRefreshToken,
  createAccessToken,
} from "../services/auth-service.js";
import type { JwtPayload } from "jsonwebtoken";

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  type AuthCookies = {
    refresh_token: string;
    access_token: string;
  };
  //   const { refresh_token: refreshToken, access_token: accessToken } =
  //     req.cookies as {
  //       refresh_token: string;
  //       access_token: string;
  //     };
  const { refresh_token: refreshToken, access_token: accessToken } =
    req.cookies as AuthCookies;

  if (!refreshToken) {
    res
      .status(401)
      .json({ message: "Unauthorized, please login again!" })
      .redirect("/login");
  }

  type decodedTypes = {
    id: string;
    name: string;
    email: string;
  };

  let decodedRefreshToken: JwtPayload | string;

  const accessCookieOptions: object = {
    maxAge: (60 * 60 * 1000) as number,
    httpOnly: true as boolean,
    sameSite: "strict" as string,
  };

  if (!accessToken) {
    decodedRefreshToken = checkRefreshToken(refreshToken as string);

    if (!decodedRefreshToken) {
      res.clearCookie("refresh_token");
      res
        .status(401)
        .json({ message: "Unauthorized, please login again!" })
        .redirect("/login");
    }

    const { id, name, email } = decodedRefreshToken as decodedTypes;
    const newaccessToken: string = createAccessToken(id, name, email);
    res.cookie("access_token", newaccessToken, accessCookieOptions);
    res.status(201).json({ message: "New access created" }).redirect("/home");
  }

  const decodedaccessToken: string | JwtPayload = checkAccessToken(
    accessToken as string,
  );

  if (!decodedaccessToken) {
    decodedRefreshToken = checkRefreshToken(refreshToken as string);
    if (!decodedRefreshToken) {
      res.clearCookie("refresh_token");
      res
        .status(401)
        .json({ message: "Unauthorized, please login again!" })
        .redirect("/login");
    }
    const { id, name, email } = decodedRefreshToken as decodedTypes;
    const newaccessToken: string = createAccessToken(id, name, email);
    res.cookie;
    res.cookie("access_token", newaccessToken, accessCookieOptions);
    res.status(201).json({ message: "New access created" }).redirect("/home");
  }

  decodedRefreshToken = checkRefreshToken(refreshToken as string);

  if (decodedRefreshToken) {
    next();
  } else {
    res.clearCookie("refresh_token");
    res.clearCookie("access_token");
    res
      .status(401)
      .json({ message: "Unauthorized, please login again!" })
      .redirect("/login");
  }
};
