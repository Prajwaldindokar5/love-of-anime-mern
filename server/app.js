import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import express from "express";
import morgan from "morgan";
import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/error.controller.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import animeRouter from "./routes/anime.routes.js";
import userRouter from "./routes/user.routes.js";
import reviewRouter from "./routes/review.routes.js";

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

//routes
app.use("/api/v1/anime", animeRouter);
app.use("/api/v1/user", userRouter);
animeRouter.use("/", reviewRouter);

//global error handling
app.all("*", (req, res, next) => {
  return next(
    new AppError(`Unable to find ${req.originalUrl} on this server`, 404)
  );
});

app.use(globalErrorHandler);

export default app;
