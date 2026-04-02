import { Router } from "express";
import {
  googleLogin,
  googleOAuthPage,
  loginUser,
  otpVerification,
  signUpUser,
} from "../controllers/auth.controller";

const router = Router();

router.route("/login").post(loginUser);
router.route("/signup").post(signUpUser);
router.route("/otp").post(otpVerification);

router.route("/google").get(googleOAuthPage).post(googleLogin);

export default router;
