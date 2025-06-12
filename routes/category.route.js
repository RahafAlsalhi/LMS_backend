import express from "express";
import * as categoryController from "../controllers/category.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/authorize.js";
const router = express.Router();
// Create category (admin only)
router.post(
  "/create",
  authenticateJWT,
  requireAdmin,
  categoryController.createCategory
);

// Update category (admin only)
router.put(
  "/edit/:id",
  authenticateJWT,
  requireAdmin,
  categoryController.updateCategory
);

// Delete category (admin only)
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireAdmin,
  categoryController.deleteCategory
);

// Get all categories (public)
router.get("/get", categoryController.getAllCategories);

// Get category by ID (public)
router.get("/get/:id", categoryController.getCategoryById);

export default router;
