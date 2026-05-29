import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import { envVars } from "./app/config/env";
import { globalErrorHandle } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { router } from "./app/routes";
import "./app/config/passport";
import "./app/config/passport";
import { connectDatabase } from "./app/middlewares/connectDatabase";

const app = express();




// Now apply all other middleware AFTER webhook routes
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: envVars.FRONTEND_URL, // use array to allow multiple origins
    credentials: true,
  })
);


app.use("/api", connectDatabase(), router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to LMS API",
  });
});

app.use(globalErrorHandle);

app.use(notFound);


export default app;