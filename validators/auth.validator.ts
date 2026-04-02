import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter valid email").trim(),
  password: z
    .string("Enter valid characters")
    .trim()
    .min(7, "Password should be more than 6 charcters")
    .max(14, "Password should not be more than 14 character"),
});

export const signUpSchema = loginSchema
  .extend({
    name: z
      .string("Enter valid name")
      .trim()
      .min(3, "Name should be more than 2 charcters")
      .max(30, "Name should not more than 30 characters"),

    confirmPassword: z.string("Enter valid confirmPassword").trim(),
    number: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Phone no. must be exactly 10 digits"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const otpVerificationSchema = signUpSchema.extend({
  otp: z
    .string("Enter valid otp")
    .trim()
    .regex(/^\d{6}$/, "Otp no. must be exactly 6 digits"),
});
