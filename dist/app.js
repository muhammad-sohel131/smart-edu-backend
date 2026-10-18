"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const env_1 = require("./app/config/env");
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const notFound_1 = require("./app/middlewares/notFound");
const routes_1 = require("./app/routes");
require("./app/config/passport");
const connectDatabase_1 = require("./app/middlewares/connectDatabase");
const app = (0, express_1.default)();
app.set("trust proxy", 1);
// Allowed origins (handles trailing slash automatically)
const allowedOrigins = [
    env_1.envVars.FRONTEND_URL,
    "https://smar-edu-frontend.vercel.app",
    "http://localhost:3000",
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin)
            return callback(null, true);
        const cleanOrigin = origin.trim().replace(/\/+$/, "");
        const isAllowed = allowedOrigins.includes(cleanOrigin) ||
            /^https:\/\/smar-edu-frontend.*\.vercel\.app$/.test(cleanOrigin);
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "x-requested-with"],
}));
app.use((0, express_session_1.default)({
    secret: env_1.envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api", (0, connectDatabase_1.connectDatabase)(), routes_1.router);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to LMS API",
    });
});
app.use(globalErrorHandler_1.globalErrorHandle);
app.use(notFound_1.notFound);
exports.default = app;
