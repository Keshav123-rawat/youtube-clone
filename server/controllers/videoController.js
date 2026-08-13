import Video from "../models/Video.js";
import Channel from "../models/Channel.js";

// Get all videos. Channel data is populated so the UI can show
// the real channel name/avatar without duplicating that data in the client.
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("channelId", "name handle avatar subscribers")
      .sort({ createdAt: -1 });

    res.status(200).json(videos);
  } catch (error) {
    console.error("Get videos error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get one video
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      "channelId",
      "name handle avatar subscribers owner",
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(video);
  } catch (error) {
    console.error("Get video error:", error);
    res.status(500).json({ message: error.message });
  }
};

function getYouTubeId(url) {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (host.includes("youtube.com")) {
      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return parsedUrl.pathname.split("/")[2] || null;
      }
      return parsedUrl.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

// Add new video
export const addVideo = async (req, res) => {
  try {
    const { title, description, thumbnail, videoUrl, category } = req.body;

    if (!title?.trim() || !description?.trim() || !videoUrl?.trim()) {
      return res.status(400).json({
        message: "Title, description and video URL are required",
      });
    }

    const youtubeId = getYouTubeId(videoUrl.trim());

    if (!youtubeId) {
      return res.status(400).json({
        message: "Please enter a valid YouTube URL",
      });
    }

    const channel = await Channel.findOne({ owner: req.user.id });

    if (!channel) {
      return res.status(400).json({
        message: "Please create a channel first",
      });
    }

    const finalThumbnail =
      thumbnail?.trim() ||
      `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

    const video = await Video.create({
      videoId: `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      youtubeId,
      title: title.trim(),
      description: description.trim(),
      category: category?.trim() || "All",
      thumbnail: finalThumbnail,
      videoUrl: videoUrl.trim(),
      channelId: channel._id,
      channelName: channel.name,
      views: 0,
    });

    const populatedVideo = await Video.findById(video._id).populate(
      "channelId",
      "name handle avatar subscribers",
    );

    res.status(201).json({
      message: "Video Added Successfully",
      video: populatedVideo,
    });
  } catch (error) {
    console.error("Add video error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update only fields that the owner is allowed to edit.
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!video.channelId) {
      return res.status(400).json({
        message: "This video is not linked to a channel",
      });
    }

    const channel = await Channel.findById(video.channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (String(channel.owner) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You can only edit your own videos",
      });
    }

    const { title, description, thumbnail, videoUrl, category } = req.body;
    const updates = {};

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ message: "Title is required" });
      }
      updates.title = String(title).trim();
    }

    if (description !== undefined) {
      if (!String(description).trim()) {
        return res.status(400).json({ message: "Description is required" });
      }
      updates.description = String(description).trim();
    }

    if (thumbnail !== undefined) updates.thumbnail = String(thumbnail).trim();
    if (category !== undefined) updates.category = String(category).trim();

    if (videoUrl !== undefined) {
      const youtubeId = getYouTubeId(String(videoUrl).trim());

      if (!youtubeId) {
        return res.status(400).json({
          message: "Please enter a valid YouTube URL",
        });
      }

      updates.videoUrl = String(videoUrl).trim();
      updates.youtubeId = youtubeId;

      if (!thumbnail?.trim()) {
        updates.thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      }
    } else if (thumbnail !== undefined && !String(thumbnail).trim()) {
      updates.thumbnail = video.youtubeId
        ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
        : video.thumbnail;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("channelId", "name handle avatar subscribers owner");

    res.status(200).json({
      message: "Video Updated Successfully",
      video: updatedVideo,
    });
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!video.channelId) {
      return res.status(400).json({
        message: "This video is not linked to a channel",
      });
    }

    const channel = await Channel.findById(video.channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (String(channel.owner) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You can only delete your own videos",
      });
    }

    await Video.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Video Deleted Successfully" });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Like / dislike / remove reaction
export const reactToVideo = async (req, res) => {
  try {
    const { reaction } = req.body;

    if (!["like", "dislike"].includes(reaction)) {
      return res.status(400).json({ message: "Invalid reaction" });
    }

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = String(req.user.id);

    video.likes = video.likes || [];
    video.dislikes = video.dislikes || [];

    const likedIndex = video.likes.findIndex(
      (id) => String(id) === userId,
    );
    const dislikedIndex = video.dislikes.findIndex(
      (id) => String(id) === userId,
    );

    if (reaction === "like") {
      if (likedIndex !== -1) {
        video.likes.splice(likedIndex, 1);
      } else {
        video.likes.push(req.user.id);

        if (dislikedIndex !== -1) {
          video.dislikes.splice(dislikedIndex, 1);
        }
      }
    } else if (dislikedIndex !== -1) {
      video.dislikes.splice(dislikedIndex, 1);
    } else {
      video.dislikes.push(req.user.id);

      if (likedIndex !== -1) {
        video.likes.splice(likedIndex, 1);
      }
    }

    await video.save();

    res.status(200).json({
      message: "Reaction updated successfully",
      likeCount: video.likes.length,
      dislikeCount: video.dislikes.length,
      liked: video.likes.some((id) => String(id) === userId),
      disliked: video.dislikes.some((id) => String(id) === userId),
    });
  } catch (error) {
    console.error("Video reaction error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMyReaction = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = String(req.user.id);
    const likes = video.likes || [];
    const dislikes = video.dislikes || [];

    res.status(200).json({
      liked: likes.some((id) => String(id) === userId),
      disliked: dislikes.some((id) => String(id) === userId),
      likeCount: likes.length,
      dislikeCount: dislikes.length,
    });
  } catch (error) {
    console.error("Get reaction error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Increment view count once when a watch page requests it.
export const addView = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({ views: video.views });
  } catch (error) {
    console.error("Add view error:", error);
    res.status(500).json({ message: error.message });
  }
};
