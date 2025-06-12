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
import submissionRouter from "./routes/submission.route.js";
import reportRoutes from "./routes/reports.route.js";

const app = express();

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== "production";

// Favicon handling
app.get("/favicon.ico", (req, res) => res.status(204).end());

// 1. IMPORTANT: Cookie parser MUST come before session
app.use(cookieParser());

// 2. Security and parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced Helmet configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "https://accounts.google.com"],
        connectSrc: ["'self'", "https://accounts.google.com"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow Google OAuth
  })
);

// FIXED: Simplified CORS configuration for localhost development
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.CLIENT_URL || "http://localhost:3000",
    ],
    credentials: true, // CRITICAL: Allow cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cookie",
    ],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Rate limiting with conditional application (most reliable approach)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // General API calls
  message: createResponse(
    false,
    "Too many requests",
    null,
    "Rate limit exceeded"
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Auth attempts
  message: createResponse(
    false,
    "Too many authentication attempts",
    null,
    "Please try again later"
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting only in production
if (!isDevelopment) {
  app.use(generalLimiter);
  console.log(" Rate limiting enabled for production");
} else {
  console.log(" Rate limiting disabled for development");
}

// FIXED: Enhanced session configuration with better localhost settings
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "lms.session", // Change default session name
  cookie: {
    secure: false, // CHANGED: Always false for localhost development
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isDevelopment ? "lax" : "strict", // CHANGED: Use lax for development
    domain: isDevelopment ? "localhost" : undefined, // ADDED: Explicit domain for localhost
  },
};

app.use(session(sessionConfig));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// 3. Passport initialization (MOVED: After session setup)
app.use(passport.initialize());
app.use(passport.session());

// 4. Add debugging middleware for development
if (isDevelopment) {
  app.use((req, res, next) => {
    next();
  });
}

// 5. Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    rateLimitingActive: !isDevelopment,
  });
});

// 6. Routes with conditional rate limiting
if (!isDevelopment) {
  app.use("/api/auth", authLimiter, authRouter); // Rate limiting in production only
} else {
  app.use("/api/auth", authRouter); // No rate limiting in development
}
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/course", courseRouter);
app.use("/api/enrollments", enrollmentRouter);
app.use("/api/lessons", lessonRouter);
app.use("/api/modules", moduleRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/reports", reportRoutes);
// 7. API documentation endpoint (optional)
app.get("/api", (req, res) => {
  res.json({
    message: "LMS API v1.0",
    documentation: "/api/docs",
    environment: process.env.NODE_ENV || "development",
    rateLimitingActive: !isDevelopment,
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      courses: "/api/course",
      categories: "/api/category",
      enrollments: "/api/enrollments",
      lessons: "/api/lessons",
      modules: "/api/modules",
      quizzes: "/api/quizzes",
      assignments: "/api/assignments",
      submissions: "/api/submissions",
      reports: "/api/reports",
    },
  });
});

// 8. Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
