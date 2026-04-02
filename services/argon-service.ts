import argon2 from "argon2";
import { AppError } from "../error/appError";

export const getHashPassword = async (password: string): Promise<string> => {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (error) {
    console.error("Error at gethashPassword:", error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const checkPassword = async (
  dbPassword: string,
  password: string,
): Promise<boolean> => {
  try {
    const isMatch: boolean = await argon2.verify(dbPassword, password);
    return isMatch;
  } catch (error) {
    console.error("Error at checkPassword:", error);
    throw new AppError("Internal Server Error!", 500);
  }
};
