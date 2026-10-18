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
import { connectDatabase } from "./app/middlewares/connectDatabase";

const app = express();

app.set("trust proxy", 1);

// Allowed origins (handles trailing slash automatically)
const allowedOrigins = [
  envVars.FRONTEND_URL,
  "https://smar-edu-frontend.vercel.app",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.trim().replace(/\/+$/, "");
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        /^https:\/\/smar-edu-frontend.*\.vercel\.app$/.test(cleanOrigin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "x-requested-with"],
  })
);

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
app.use(express.urlencoded({ extended: true }));


app.use("/api", connectDatabase(), router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to LMS API",
  });
});

app.use(globalErrorHandle);

app.use(notFound);


export default app;