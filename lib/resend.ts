import { Resend } from "resend";
import { env } from "../validators/env.validator";
import fs from "fs/promises";
import path from "path";
import { consoleError } from "../error/displayConsoleError";
import { AppError } from "../error/appError";

const { data, error } = env;

if (error) {
  console.log(error);
}
const filePath = path.resolve(import.meta.dirname, "/mails", "/otp-mail.html");

const template = await fs.readFile(filePath, "utf-8");

const resend = new Resend(data?.RESEND_API_KEY);

export const sendEmail = async (otpCode: string, email: string) => {
  try {
    const response = await resend.emails.send({
      from: "Local Store App <rocio.schuster@ethereal.email>",
      to: email,
      subject: "OTP-Verification Code",
      html: template.replace("{{OTP_CODE}}", otpCode),
    });
    console.log("Response of otp send:", response);
  } catch (error) {
    consoleError("sendEmail", error);
    throw new AppError("Internal Server Error", 500);
  }
};
