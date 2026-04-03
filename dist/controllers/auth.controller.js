import { loginSchema, otpVerificationSchema, signUpSchema, } from "../validators/auth.validator.js";
import { createOtp, createTokens, verifyOtp, } from "../services/auth-service.js";
import { checkPassword } from "../services/argon-service.js";
import { checkUserByEmail, createUser } from "../services/db-services.js";
import { AppError } from "../error/appError.js";
import { sendEmail } from "../lib/resend.js";
import { consoleError } from "../error/displayConsoleError.js";
import { google } from "../oauth/google.oauth.js";
import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import { checkOauthEntryByEmail, fillOauthEntry, } from "../services/oauth-services.js";
import { github } from "../oauth/github.oauth.js";
export const loginUser = async (req, res) => {
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
        const isValidPassword = await checkPassword(existingUser?.password, data?.password);
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
    }
    catch (error) {
        consoleError("loginUser", error);
        throw new AppError("Internal Server Error", 500);
    }
};
export const signUpUser = async (req, res) => {
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
    }
    catch (error) {
        consoleError("signUpUser", error);
        throw new AppError("Internal Server Error", 500);
    }
};
export const otpVerification = async (req, res) => {
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
    }
    catch (error) {
        consoleError("otpVerification", error);
        throw new AppError("Internal Server Error", 500);
    }
};
export const googleOAuthPage = (req, res) => {
    try {
        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        const url = google.createAuthorizationURL(state, codeVerifier, [
            "openid",
            "profile",
            "email",
        ]);
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 10 * 60 * 1000,
            sameSite: "none",
        };
        res.cookie("google_oauth_state", state, cookieOptions);
        res.cookie("google_code_verifier", codeVerifier, cookieOptions);
        res.status(200).redirect(url.toString());
    }
    catch (error) {
        consoleError("googleOAuthPage", error);
        throw new AppError("Internal Server Error", 500);
    }
};
export const googleLogin = async (req, res) => {
    try {
        const { code, state } = req.query;
        const { google_oauth_state: clientState, google_code_verifier: codeVerifier, } = req.cookies;
        if (!code ||
            !state ||
            !codeVerifier ||
            !clientState ||
            clientState !== state) {
            res
                .status(403)
                .json({ message: "Something went wrong please try again" })
                .redirect("/login");
        }
        const tokens = await google.validateAuthorizationCode(code, codeVerifier);
        const claims = decodeIdToken(tokens.idToken());
        const { name, email, picture } = claims;
        const oauthEntry = await checkOauthEntryByEmail(email);
        const user = await checkUserByEmail(email);
        if (user && oauthEntry) {
            createTokens(res, user.userId, user.name, user.email);
        }
        else if (oauthEntry && !user) {
            const user = await createUser(name, email, picture);
            createTokens(res, user.userId, user.name, user.email);
        }
        else if (!oauthEntry && user) {
            await fillOauthEntry(user.userId, "google", email);
            createTokens(res, user.userId, user.name, user.email);
        }
        else if (!oauthEntry && !user) {
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
    }
    catch (error) {
        consoleError("googleLogin", error);
        throw new AppError("Internal Server Error!", 500);
    }
};
export const githubOauthPage = (req, res) => {
    try {
        const state = generateState();
        const url = github.createAuthorizationURL(state, [
            "read:user",
            "user:email",
        ]);
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 10 * 60 * 1000,
            sameSite: "none",
        };
        res.cookie("github_oauth_state", state, cookieOptions);
        res.status(200).redirect(url.toString());
    }
    catch (error) {
        consoleError("githubOauthPage", error);
        throw new AppError("Internal Server Error", 500);
    }
};
export const githubLogin = async (req, res) => {
    try {
        const { code, state } = req.query;
        const { github_oauth_state: clientState } = req.cookies;
        if (!code || !state || !clientState || clientState !== state) {
            res
                .status(403)
                .json({ message: "Something went wrong please try again" })
                .redirect("/login");
        }
        const tokens = await github.validateAuthorizationCode(code);
        const claims = decodeIdToken(tokens.idToken());
        const { login: name, email, avatar_url: picture } = claims;
        const oauthEntry = await checkOauthEntryByEmail(email);
        const user = await checkUserByEmail(email);
        if (user && oauthEntry) {
            createTokens(res, user.userId, user.name, user.email);
        }
        else if (oauthEntry && !user) {
            const user = await createUser(name, email, picture);
            createTokens(res, user.userId, user.name, user.email);
        }
        else if (!oauthEntry && user) {
            await fillOauthEntry(user.userId, "github", email);
            createTokens(res, user.userId, user.name, user.email);
        }
        else if (!oauthEntry && !user) {
            const user = await createUser(name, email, picture);
            createTokens(res, user.userId, user.name, user.email);
            await fillOauthEntry(user.userId, "github", email);
        }
        return res
            .status(200)
            .json({
            message: "User succcessfully loggedin",
        })
            .redirect("/home");
    }
    catch (error) {
        consoleError("githubLogin", error);
        throw new AppError("Internal Server Error", 500);
    }
};
