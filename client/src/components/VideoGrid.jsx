import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import VideoCard from "./VideoCard";
import "../styles/VideoGrid.css";

function VideoGrid({ search = "", selectedCategory = "All" }) {
  const [dbVideos, setDbVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadVideos() {
    try {
      setLoading(true);
      setError("");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await axios.get(`${API_URL}/api/videos`, {
        timeout: 10000,
      });
      setDbVideos(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Home videos loading error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load videos. Please start the backend server.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return dbVideos.filter((video) => {
      const title = video.title || "";
      const channelName = video.channelId?.name || video.channelName || "";

      const matchesSearch =
        !searchText ||
        title.toLowerCase().includes(searchText) ||
        channelName.toLowerCase().includes(searchText);

      const category = video.category || "All";
      const matchesCategory =
        selectedCategory === "All" ||
        category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [dbVideos, search, selectedCategory]);

  if (loading) {
    return (
      <div className="video-grid-status" role="status" aria-live="polite">
        Loading videos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-grid-status">
        <p>{error}</p>
        <button onClick={loadVideos}>Try Again</button>
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="video-grid-status">
        <h3>No videos found</h3>
        <p>
          {search
            ? `No results for "${search}".`
            : selectedCategory !== "All"
              ? `No videos in ${selectedCategory} yet.`
              : "Upload a video to your channel to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {filteredVideos.map((video) => (
        <VideoCard
          key={video._id}
          video={{
            ...video,
            videoId: video._id,
            uploader: video.channelId?.name || video.channelName || "YouTube",
            channelLogo: video.channelId?.avatar || video.channelLogo || "",
            uploadDate: video.createdAt,
          }}
        />
      ))}
    </div>
  );
}

export default VideoGrid;
