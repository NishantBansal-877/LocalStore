import { Router } from "express";
import {
  githubLogin,
  googleLogin,
  googleOAuthPage,
  loginUser,
  otpVerification,
  signUpUser,
} from "../controllers/auth.controller.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/signup").post(signUpUser);
router.route("/otp").post(otpVerification);

router.route("/google").get(googleOAuthPage);
router.route("/google/callback").post(googleLogin);
router.route("/github").get(googleOAuthPage);
router.route("/github/callback").post(githubLogin);

export default router;
