import express from "express";
import * as moduleController from "../controllers/module.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// Create module (admin/instructor only)
router.post(
  "/create",
  authenticateJWT,
  requireRole("admin", "instructor"),
  moduleController.createModule
);

// Update module (admin/instructor only)
router.put(
  "/edit/:id",
  authenticateJWT,
  requireRole("admin", "instructor"),
  moduleController.updateModule
);

// Delete module (admin/instructor only)
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireRole("admin", "instructor"),
  moduleController.deleteModule
);

// Get all modules for a course (public)
router.get("/course/:course_id", moduleController.getModulesByCourse);

// Get module by ID (public)
router.get("/get/:id", moduleController.getModuleById);

export default router;
