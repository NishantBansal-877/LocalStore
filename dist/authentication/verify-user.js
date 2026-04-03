import { checkAccessToken, checkRefreshToken, createAccessToken, } from "../services/auth-service.js";
export const verifyUser = async (req, res, next) => {
    //   const { refresh_token: refreshToken, access_token: accessToken } =
    //     req.cookies as {
    //       refresh_token: string;
    //       access_token: string;
    //     };
    const { refresh_token: refreshToken, access_token: accessToken } = req.cookies;
    if (!refreshToken) {
        res
            .status(401)
            .json({ message: "Unauthorized, please login again!" })
            .redirect("/login");
    }
    let decodedRefreshToken;
    const accessCookieOptions = {
        maxAge: (60 * 60 * 1000),
        httpOnly: true,
        sameSite: "strict",
    };
    if (!accessToken) {
        decodedRefreshToken = checkRefreshToken(refreshToken);
        if (!decodedRefreshToken) {
            res.clearCookie("refresh_token");
            res
                .status(401)
                .json({ message: "Unauthorized, please login again!" })
                .redirect("/login");
        }
        const { id, name, email } = decodedRefreshToken;
        const newaccessToken = createAccessToken(id, name, email);
        res.cookie("access_token", newaccessToken, accessCookieOptions);
        res.status(201).json({ message: "New access created" }).redirect("/home");
    }
    const decodedaccessToken = checkAccessToken(accessToken);
    if (!decodedaccessToken) {
        decodedRefreshToken = checkRefreshToken(refreshToken);
        if (!decodedRefreshToken) {
            res.clearCookie("refresh_token");
            res
                .status(401)
                .json({ message: "Unauthorized, please login again!" })
                .redirect("/login");
        }
        const { id, name, email } = decodedRefreshToken;
        const newaccessToken = createAccessToken(id, name, email);
        res.cookie;
        res.cookie("access_token", newaccessToken, accessCookieOptions);
        res.status(201).json({ message: "New access created" }).redirect("/home");
    }
    decodedRefreshToken = checkRefreshToken(refreshToken);
    if (decodedRefreshToken) {
        next();
    }
    else {
        res.clearCookie("refresh_token");
        res.clearCookie("access_token");
        res
            .status(401)
            .json({ message: "Unauthorized, please login again!" })
            .redirect("/login");
    }
};
