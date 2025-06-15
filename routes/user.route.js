import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { validateBody } from "../middleware/validateBody.js";
import { UserSchema, UpdateUserSchema } from "../validation/user.Schema.js";
import { ChangePasswordSchema } from "../validation/changePassword.Schema.js";
import { requireSelfOnly, requireAdmin } from "../middleware/authorize.js";

const router = express.Router();

// Create user (registration) - Use UserSchema for validation
router.post(
  "/create",
  authenticateJWT,
  requireAdmin,
  validateBody(UserSchema),
  userController.createUserController
);

// Update user - Use UpdateUserSchema (no password field)
router.put(
  "/edit/:id",
  authenticateJWT,
  requireAdmin,
  validateBody(UpdateUserSchema),
  userController.updateUserController
);

// Delete user
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireAdmin,
  userController.deleteUserController
);

// Get all users (admin)
router.get(
  "/get",
  authenticateJWT,
  requireAdmin,
  userController.getAllUsersController
);

// Get user by ID
router.get("/get/:id", authenticateJWT, userController.getUserByIdController);

// Get user by email (query param)
router.get(
  "/search/by-email",
  authenticateJWT,
  userController.getUserByEmailController
);

// Change user password (separate endpoint)
router.put(
  "/edit/:id/password",
  authenticateJWT,
  requireSelfOnly((req) => req.params.id),
  validateBody(ChangePasswordSchema),
  userController.changeUserPasswordController
);

// Toggle user status
router.patch(
  "/:id/status",
  authenticateJWT,
  requireAdmin,
  userController.toggleUserStatus
);

// Get all users with admin details
router.get(
  "/admin/all",
  authenticateJWT,
  requireAdmin,
  userController.getAllUsersAdmin
);

export default router;
