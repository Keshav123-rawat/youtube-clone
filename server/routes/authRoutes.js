import express from "express";
import {
  registerUser,
  loginUser,
  deleteAccount,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

// Delete Route
router.delete("/delete-account", authMiddleware, deleteAccount);

export default router;
