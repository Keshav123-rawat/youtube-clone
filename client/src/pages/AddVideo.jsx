import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AddVideo.css";

const categories = [
  "All",
  "Music",
  "Gaming",
  "React",
  "JavaScript",
  "Live",
  "News",
  "Movies",
  "Podcasts",
  "AI",
  "Programming",
  "MongoDB",
  "CSS",
  "HTML",
  "Coding",
  "Cricket",
  "Football",
  "Comedy",
  "Songs",
];

function AddVideo() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/videos",
        {
          title: title.trim(),
          description: description.trim(),
          thumbnail: thumbnail.trim(),
          videoUrl: videoUrl.trim(),
          category,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );

      setMessage(response.data.message || "Video successfully added!");
      setMessageType("success");

      setTimeout(() => {
        const channelId = response.data.video?.channelId?._id ||
          response.data.video?.channelId;

        navigate(channelId ? `/channel/${channelId}` : "/");
      }, 600);
    } catch (error) {
      console.error("Add video error:", error);
      setMessage(
        error.response?.data?.message ||
          "Unable to add video. Please try again.",
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-video-page">
      <div className="add-video-card">
        <h1>Add Video</h1>
        <p>Add a YouTube video to your channel.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Video Title</label>
            <input
              type="text"
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Enter video description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              maxLength={5000}
              required
            />
          </div>

          <div className="form-group">
            <label>Thumbnail URL (optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
            <span>If empty, the YouTube thumbnail will be used.</span>
          </div>

          <div className="form-group">
            <label>YouTube Video URL</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {message && (
            <p className={`add-video-message ${messageType}`}>{message}</p>
          )}

          <div className="add-video-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Adding Video..." : "Add Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVideo;
