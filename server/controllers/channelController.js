import Channel from "../models/Channel.js";
import Video from "../models/Video.js";

// Create Channel
export const createChannel = async (req, res) => {
  try {
    const { name, handle, avatar } = req.body;
    const cleanName = String(name || "").trim();
    const rawHandle = String(handle || "").trim();
    const cleanHandle = rawHandle.startsWith("@")
      ? rawHandle
      : `@${rawHandle}`;

    if (!cleanName || cleanHandle.length < 2) {
      return res.status(400).json({
        message: "Channel name and handle are required",
      });
    }

    if (cleanName.length < 2 || cleanName.length > 50) {
      return res.status(400).json({
        message: "Channel name must be between 2 and 50 characters",
      });
    }

    if (!/^@[a-zA-Z0-9._-]+$/.test(cleanHandle)) {
      return res.status(400).json({
        message: "Handle may contain letters, numbers, dots, underscores and hyphens",
      });
    }

    // Check if user already has a channel
    const existingChannel = await Channel.findOne({
      owner: req.user.id,
    });

    if (existingChannel) {
      return res.status(400).json({
        message: "You already have a channel",
      });
    }

    // Check handle
    const handleExists = await Channel.findOne({
      handle: cleanHandle,
    });

    if (handleExists) {
      return res.status(400).json({
        message: "Handle already exists",
      });
    }

    const channel = await Channel.create({
      name: cleanName,
      handle: cleanHandle,
      ...(avatar ? { avatar } : {}),
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Channel Created Successfully",
      channel,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get logged-in user's channel
export const getMyChannel = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      owner: req.user.id,
    });

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    res.status(200).json(channel);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get channel by ID
export const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    const videos = await Video.find({
      channelId: channel._id,
    });

    res.status(200).json({
      channel,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Subscribe / Unsubscribe Channel
export const toggleSubscribe = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    // User cannot subscribe to their own channel
    if (String(channel.owner) === String(req.user.id)) {
      return res.status(400).json({
        message: "You cannot subscribe to your own channel",
      });
    }

    const userId = String(req.user.id);

    const alreadySubscribed = channel.subscribers.some(
      (subscriber) => String(subscriber) === userId,
    );

    if (alreadySubscribed) {
      // Unsubscribe
      channel.subscribers = channel.subscribers.filter(
        (subscriber) => String(subscriber) !== userId,
      );

      await channel.save();

      return res.status(200).json({
        message: "Unsubscribed successfully",
        subscribed: false,
        subscriberCount: channel.subscribers.length,
      });
    }

    // Subscribe
    channel.subscribers.push(req.user.id);

    await channel.save();

    return res.status(200).json({
      message: "Subscribed successfully",
      subscribed: true,
      subscriberCount: channel.subscribers.length,
    });
  } catch (error) {
    console.error("Subscribe error:", error);

    res.status(500).json({
      message: "Server error while updating subscription",
    });
  }
};
