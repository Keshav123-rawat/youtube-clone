import express from "express";

import {
  createChannel,
  getMyChannel,
  getChannel,
  toggleSubscribe,
} from "../controllers/channelController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create channel - Login required
router.post("/", authMiddleware, createChannel);

// Get logged-in user's channel
router.get("/me", authMiddleware, getMyChannel);

// Get channel by ID
router.get("/:id", getChannel);

router.post("/:id/subscribe", authMiddleware, toggleSubscribe);

export default router;
