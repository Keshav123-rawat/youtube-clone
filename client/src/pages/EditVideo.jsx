import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/EditVideo.css";

const categories = [
  "All", "Music", "Gaming", "React", "JavaScript", "Live", "News", "Movies",
  "Podcasts", "AI", "Programming", "MongoDB", "CSS", "HTML", "Coding",
  "Cricket", "Football", "Comedy", "Songs",
];

function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }

    async function fetchVideo() {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/videos/${id}`,
          { timeout: 10000 },
        );

        const foundVideo = response.data;
        setVideo(foundVideo);
        setTitle(foundVideo.title || "");
        setDescription(foundVideo.description || "");
        setThumbnail(foundVideo.thumbnail || "");
        setVideoUrl(foundVideo.videoUrl || "");
        setCategory(foundVideo.category || "All");
      } catch (error) {
        console.error("Fetch video error:", error);
        setMessage(
          error.response?.data?.message || "Unable to load video",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [id, navigate, token]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!token) {
      navigate("/signin");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await axios.put(
        `http://localhost:5000/api/videos/${id}`,
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

      setMessage(response.data.message || "Video updated successfully!");

      const channelId =
        response.data.video?.channelId?._id ||
        response.data.video?.channelId ||
        video?.channelId?._id ||
        video?.channelId;

      setTimeout(() => {
        navigate(channelId ? `/channel/${channelId}` : "/");
      }, 600);
    } catch (error) {
      console.error("Update error:", error);
      setMessage(
        error.response?.data?.message ||
          "Unable to update video. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="edit-video-status">Loading video...</div>;
  }

  if (!video) {
    return (
      <div className="edit-video-status">
        <h2>{message || "Video not found"}</h2>
        <button onClick={() => navigate("/")}>Back Home</button>
      </div>
    );
  }

  return (
    <div className="edit-video-page">
      <div className="edit-video-card">
        <h1>Edit Video</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              maxLength={5000}
              required
            />
          </div>

          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>YouTube Video URL</label>
            <input
              type="url"
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
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {message && <p className="edit-video-message">{message}</p>}

          <div className="edit-video-actions">
            <button type="button" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVideo;
