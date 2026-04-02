import { AppError } from "../error/appError";
import { prisma } from "../lib/prisma";

export const checkUserByEmail = async (email: string) => {
  try {
    const user = await prisma.users.findFirst({
      where: {
        email,
      },
      select: {
        userId: true,
        name: true,
        email: true,
        password: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error at checkUserByEmail", error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const createUser = async (
  name: string,
  email: string,
  profilePic: string = "",
  password: string = "",
  number: string = "",
) => {
  try {
    const role = "user";
    const user = await prisma.users.create({
      data: {
        name,
        email,
        profilePic,
        password,
        phone: number,
        role,
      },
      select: {
        userId: true,
        name: true,
        email: true,
        phone: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error at createUser", error);
    throw new AppError("Internal Server Error", 500);
  }
};
