import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { validateBody } from "../middleware/validateBody.js";
import { UserSchema } from "../validation/user.Schema.js";
import { ChangePasswordSchema } from "../validation/changePassword.Schema.js";

const router = express.Router();

// Create user (registration)
router.post(
  "/create",
  validateBody(UserSchema),
  userController.createUserController
);

// Update user
router.put(
  "/edit/:id",
  authenticateJWT,
  validateBody(UserSchema),
  userController.updateUserController
);

// Delete user
router.delete(
  "/delete/:id",
  authenticateJWT,
  userController.deleteUserController
);

// Get all users (admin)
router.get("/get", authenticateJWT, userController.getAllUsersController);

// Get user by ID
router.get("/get/:id", authenticateJWT, userController.getUserByIdController);

// Get user by email (query param)
router.get(
  "/search/by-email",
  authenticateJWT,
  userController.getUserByEmailController
);

// Change user password
router.put(
  "/edit/:id/password",
  authenticateJWT,
  validateBody(ChangePasswordSchema),
  userController.changeUserPasswordController
);

export default router;
