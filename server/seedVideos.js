import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Video from "./models/Video.js";

dotenv.config();

const videos = [
  {
    videoId: "video01",
    title: "Learn React in 30 Minutes",
    category: "React",
    description: "A quick tutorial to get started with React.",
    thumbnail: "https://i.ytimg.com/vi/M7lc1UVf-VE/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    channelName: "CodeWithHarry",
    views: 15200,
  },

  {
    videoId: "video02",
    title: "JavaScript Complete Tutorial",
    category: "JavaScript",
    description: "Learn JavaScript fundamentals from scratch.",
    thumbnail: "https://i.ytimg.com/vi/ysz5S6PUM-U/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    channelName: "CodeWithHarry",
    views: 20400,
  },

  {
    videoId: "video03",
    title: "React Hooks Explained",
    category: "React",
    description: "Understand React Hooks with simple examples.",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    channelName: "CodeWithHarry",
    views: 18900,
  },

  {
    videoId: "video04",
    title: "Top Music Hits 2026",
    category: "Music",
    description: "Enjoy the latest music hits and trending songs.",
    thumbnail: "https://i.ytimg.com/vi/ScMzIvxBSi4/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    channelName: "Music World",
    views: 1250000,
  },
];

async function seedVideos() {
  try {
    await connectDB();

    await Video.deleteMany();

    await Video.insertMany(videos);

    console.log("✅ Videos added to MongoDB successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding videos:", error.message);

    process.exit(1);
  }
}

seedVideos();
