import { AppError } from "../error/appError.js";
import { consoleError } from "../error/displayConsoleError.js";
import { prisma } from "../lib/prisma.js";
export const checkOauthEntryByEmail = async (email) => {
    try {
        const oauthEntry = await prisma.oauth.findFirst({
            where: {
                email,
            },
        });
        return oauthEntry;
    }
    catch (error) {
        consoleError("checkOauthEntryByEmail", error);
        throw new AppError("Internal Server Error", 500);
    }
};
export const fillOauthEntry = async (userId, authType, email) => {
    try {
        const entry = await prisma.oauth.create({
            data: {
                userId,
                authType,
                email,
            },
        });
        return entry;
    }
    catch (error) {
        consoleError("fillOauthEntry", error);
        throw new AppError("Internal Server Error", 500);
    }
};
