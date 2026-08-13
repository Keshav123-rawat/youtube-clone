import Comment from "../models/Comment.js";

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      videoId: req.params.videoId,
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { videoId, text } = req.body;

    if (!videoId || !text?.trim()) {
      return res.status(400).json({
        message: "Video ID and comment are required",
      });
    }

    const comment = await Comment.create({
      videoId,
      userId: req.user.id,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "name email",
    );

    res.status(201).json({
      message: "Comment Added Successfully",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (String(comment.userId) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      message: "Comment Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (String(comment.userId) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You can only edit your own comments",
      });
    }

    comment.text = text.trim();
    await comment.save();

    const updatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "name email",
    );

    res.status(200).json({
      message: "Comment Updated Successfully",
      comment: updatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
