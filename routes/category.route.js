import express from "express";
import * as categoryController from "../controllers/category.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// Create category (protected)
router.post(
  "/create",
  authenticateJWT,
  requireRole("admin"),
  categoryController.createCategory
);

// Update category (protected)
router.put(
  "/edit/:id",
  authenticateJWT,
  requireRole("admin"),
  categoryController.updateCategory
);

// Delete category (protected)
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireRole("admin"),
  categoryController.deleteCategory
);

// Get all categories (public)
router.get("/get", categoryController.getAllCategories);

// Get category by ID (public)
router.get("/get/:id", categoryController.getCategoryById);

export default router;
