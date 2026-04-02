import type { CookieOptions, Request, Response } from "express";
import {
  loginSchema,
  otpVerificationSchema,
  signUpSchema,
} from "../validators/auth.validator";
import {
  createAccessToken,
  createOtp,
  createRefreshToken,
  createTokens,
  verifyOtp,
} from "../services/auth-service";
import { checkPassword, getHashPassword } from "../services/argon-service";
import { checkUserByEmail, createUser } from "../services/db-services";
import { AppError } from "../error/appError";
import { sendEmail } from "../lib/resend";
import { consoleError } from "../error/displayConsoleError";
import { google } from "../oauth/google.oauth";
import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import {
  checkOauthEntryByEmail,
  fillOauthEntry,
} from "../services/oauth-services";
import { string } from "zod";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { data, error } = loginSchema.safeParse(req.body);

    if (error) {
      console.log(error);
      return res.send();
    }

    const existingUser = await checkUserByEmail(data.email);

    if (!existingUser) {
      res.status(400).json({
        message: "User not exists: Enter valid email.",
      });
    }

    const isValidPassword = await checkPassword(
      existingUser?.password!,
      data?.password!,
    );

    if (!isValidPassword) {
      res.status(400).json({
        message: "Incorrect password.",
      });
    }

    const otp = await createOtp(data.email);
    sendEmail(otp, data.email);

    res
      .status(201)
      .json({ message: "Otp sent to your email" })
      .redirect("/otp");
  } catch (error) {
    consoleError("loginUser", error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const signUpUser = async (req: Request, res: Response) => {
  try {
    const { data, error } = signUpSchema.safeParse(req.body);

    if (error) {
      console.log(error);
      return res.send();
    }

    const existingUser = await checkUserByEmail(data.email);

    if (existingUser) {
      res.status(400).json({
        message: "User already exists",
      });
    }

    const otp = await createOtp(data.email);
    sendEmail(otp, data.email);

    res
      .status(201)
      .json({ message: "Otp sent to your email." })
      .redirect("/otp");
  } catch (error) {
    consoleError("signUpUser", error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const otpVerification = async (req: Request, res: Response) => {
  try {
    const { data, error } = otpVerificationSchema.safeParse(req.body);
    if (error) {
      console.log(error);
      return res.send();
    }

    const isValidOtp = await verifyOtp(data.email, data.otp);

    if (!isValidOtp) {
      res
        .status(400)
        .json({ message: "Invlalid otp: Please enter valid otp." });
    }

    const { name, email, number, password } = data;

    const user = await createUser(name, email, "", password, number);

    createTokens(res, user.userId, name, email);

    const routeName = req.path.split("/").pop();

    res.status(201).json({
      message: `User successfully ${routeName === "login" ? "loggedin" : "registered"}.`,
    });
  } catch (error) {
    consoleError("otpVerification", error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const googleOAuthPage = (req: Request, res: Response) => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 10 * 60 * 1000,
      sameSite: "none",
    };

    res.cookie("google_oauth_state", state, cookieOptions);
    res.cookie("google_code_verifier", codeVerifier, cookieOptions);
    res.status(200).redirect(url.toString());
  } catch (error) {}
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { code, state, scope } = req.query;
    const { codeVerifier } = req.body;

    if (!code || !state || !scope) {
      res
        .status(403)
        .json({ message: "Something went wrong please try again" })
        .redirect("/login");
    }

    const tokens = await google.validateAuthorizationCode(
      code as string,
      codeVerifier,
    );

    const claims = decodeIdToken(tokens.idToken());

    type ClaimsType = {
      sub: string;
      name: string;
      email: string;
      picture: string;
    };

    const { name, email, picture } = claims as ClaimsType;

    const oauthEntry = await checkOauthEntryByEmail(email);
    const user = await checkUserByEmail(email);

    if (user && oauthEntry) {
      createTokens(res, user.userId, user.name, user.email);
    }

    if (oauthEntry && !user) {
      const user = await createUser(name, email, picture);
      createTokens(res, user.userId, user.name, user.email);
    }

    if (!oauthEntry && user) {
      await fillOauthEntry(user.userId, "google", email);
      createTokens(res, user.userId, user.name, user.email);
    }

    if (!oauthEntry && !user) {
      const user = await createUser(name, email, picture);
      createTokens(res, user.userId, user.name, user.email);
      await fillOauthEntry(user.userId, "google", email);
    }
    return res
      .status(200)
      .json({
        message: "User succcessfully loggedin",
      })
      .redirect("/home");
  } catch (error) {
    consoleError("googleLogin", error);
    throw new AppError("Internal Server Error!", 500);
  }
};
