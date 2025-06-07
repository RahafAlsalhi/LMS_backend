import express from "express";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { errorHandler, notFound } from "./middleware/error.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import rateLimit from "express-rate-limit";
import { createResponse } from "./utils/helper.js";
import categoryRouter from "./routes/category.route.js";
import courseRouter from "./routes/course.route.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.Routes.js";
import enrollmentRouter from "./routes/enrollment.route.js";
import lessonRouter from "./routes/lesson.route.js";
import moduleRouter from "./routes/module.route.js";
import quizRouter from "./routes/quiz.route.js";
import assignmentRouter from "./routes/assignment.route.js";

const app = express();

app.get("/favicon.ico", (req, res) => res.status(204).end());
// 1. Core middleware

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["POST", "DELETE", "PUT", "GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const Limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: createResponse(
    false,
    "too many requests",
    null,
    "rate limit exceeded"
  ),
  standardHeaders: true,
  legacyHeader: false,
});
app.use(Limiter);

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "strict",
  },
};

app.use(session(sessionConfig));

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());

// 2. Passport
app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
//3.routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/course", courseRouter);
app.use("/api/auth", authRouter);
app.use("/api/enrollments", enrollmentRouter);
app.use("/api/lessons", lessonRouter);
app.use("/api/modules", moduleRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/assignments", assignmentRouter);
// 4. Health and root endpoints
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
// 5. Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
