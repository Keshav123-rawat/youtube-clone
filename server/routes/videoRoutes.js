import express from "express";
import {
  getVideos,
  getVideoById,
  addVideo,
  updateVideo,
  deleteVideo,
  reactToVideo,
  getMyReaction,
  addView,
} from "../controllers/videoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getVideos);
router.get("/:id", getVideoById);

router.post("/", authMiddleware, addVideo);
router.post("/:id/view", addView);

router.put("/:id", authMiddleware, updateVideo);
router.delete("/:id", authMiddleware, deleteVideo);

router.post("/:id/reaction", authMiddleware, reactToVideo);
router.get("/:id/reaction", authMiddleware, getMyReaction);

export default router;
