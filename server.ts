import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware";
import { verifyUser } from "./authentication/verify-user";
import authRouter from "./routes/auth.route";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3002"],
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use("/", verifyUser);

app.use("/auth", authRouter);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
