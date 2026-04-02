import { AppError } from "../error/appError";
import { consoleError } from "../error/displayConsoleError";
import type { OAUTH } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

export const checkOauthEntryByEmail = async (email: string) => {
  try {
    const oauthEntry = await prisma.oauth.findFirst({
      where: {
        email,
      },
    });
    return oauthEntry;
  } catch (error) {
    consoleError("checkOauthEntryByEmail", error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const fillOauthEntry = async (
  userId: string,
  authType: OAUTH,
  email: string,
) => {
  try {
    const entry = await prisma.oauth.create({
      data: {
        userId,
        authType,
        email,
      },
    });
    return entry;
  } catch (error) {
    consoleError("fillOauthEntry", error);
    throw new AppError("Internal Server Error", 500);
  }
};
