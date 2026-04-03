import { Resend } from "resend";
import { env } from "../validators/env.validator.js";
import * as fs from "fs/promises";
import * as path from "path";
import { consoleError } from "../error/displayConsoleError.js";
import { AppError } from "../error/appError.js";
import { fileURLToPath } from "url";

const { data, error } = env;

if (error) {
  console.log(error);
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filePath = path.resolve(__dirname, "../mails/otp-mail.html");

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
