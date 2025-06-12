import express from "express";
import * as reportController from "../controllers/reports.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/authorize.js";

const router = express.Router();

// All report routes require admin authentication
router.get(
  "/user-activity",
  authenticateJWT,
  requireAdmin,
  reportController.getUserActivityReport
);

router.get(
  "/course-popularity",
  authenticateJWT,
  requireAdmin,
  reportController.getCoursePopularityReport
);

router.get(
  "/enrollment-stats",
  authenticateJWT,
  requireAdmin,
  reportController.getEnrollmentStats
);

router.get(
  "/category-stats",
  authenticateJWT,
  requireAdmin,
  reportController.getCategoryStats
);

export default router;
