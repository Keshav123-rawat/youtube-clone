import express from "express";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Comments of a Video
router.get("/:videoId", getComments);

// Add Comment (Protected)
router.post("/", authMiddleware, addComment);

// Update Comment
router.put("/:id", authMiddleware, updateComment);

// Delete Comment (Protected)
router.delete("/:id", authMiddleware, deleteComment);

export default router;
