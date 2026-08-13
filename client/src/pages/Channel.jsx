import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { MdCameraAlt } from "react-icons/md";
import "../styles/Channel.css";

function Channel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [banner, setBanner] = useState(
    () => localStorage.getItem(`channelBanner-${id || "me"}`) || "",
  );

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [sort, setSort] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteVideoId, setDeleteVideoId] = useState(null);

  // ===============================
  // SUBSCRIBE STATES
  // ===============================
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ===============================
  // BANNER
  // ===============================
  function handleBannerChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageUrl = reader.result;

      setBanner(imageUrl);
      localStorage.setItem(`channelBanner-${channel?._id || id || "me"}`, imageUrl);
    };

    reader.readAsDataURL(file);
  }

  // ===============================
  // LOAD CHANNEL
  // ===============================
  async function loadChannel() {
    try {
      setLoading(true);
      setError("");

      let channelData;
      let videosData = [];

      // ===============================
      // MY CHANNEL
      // ===============================
      if (!id || id === "me") {
        if (!token) {
          navigate("/signin");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/channels/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000,
          },
        );

        channelData = response.data;

        // Get videos using channel ID
        const videosResponse = await axios.get(
          `http://localhost:5000/api/channels/${channelData._id}`,
          {
            timeout: 10000,
          },
        );

        videosData = videosResponse.data.videos || [];
      }

      // ===============================
      // PUBLIC CHANNEL
      // ===============================
      else {
        const response = await axios.get(
          `http://localhost:5000/api/channels/${id}`,
          {
            timeout: 10000,
          },
        );

        channelData = response.data.channel;
        videosData = response.data.videos || [];
      }

      // ===============================
      // SET CHANNEL DATA
      // ===============================
      if (!channelData) {
        setError("Channel not found");
        return;
      }

      setChannel(channelData);
      setVideos(videosData);

      const storedBanner = localStorage.getItem(
        `channelBanner-${channelData._id}`,
      );
      if (storedBanner) {
        setBanner(storedBanner);
      }

      // ===============================
      // SUBSCRIBER COUNT
      // ===============================
      setSubscriberCount(channelData.subscribers?.length || 0);

      // ===============================
      // CHECK SUBSCRIPTION
      // ===============================
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");

      if (currentUser && channelData.subscribers) {
        const isSubscribed = channelData.subscribers.some(
          (subscriber) =>
            String(subscriber?._id || subscriber) === String(currentUser.id),
        );

        setSubscribed(isSubscribed);
      } else {
        setSubscribed(false);
      }
    } catch (err) {
      console.error("Channel error:", err);

      if (err.response) {
        setError(err.response.data?.message || "Unable to load channel");
      } else if (err.code === "ECONNABORTED") {
        setError("Server response is taking too long. Please try again.");
      } else {
        setError("Server se connection nahi ho raha.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ===============================
  // LOAD ON PAGE OPEN
  // ===============================
  useEffect(() => {
    loadChannel();
  }, [id]);

  // ===============================
  // SORT VIDEOS
  // ===============================
  function getSortedVideos() {
    const sorted = [...videos];

    if (sort === "popular") {
      return sorted.sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
    }

    if (sort === "oldest") {
      return sorted.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      );
    }

    return sorted.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }

  // ===============================
  // SUBSCRIBE / UNSUBSCRIBE
  // ===============================
  async function handleSubscribe() {
    if (!token) {
      navigate("/signin");
      return;
    }

    if (!channel) return;

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    // Owner cannot subscribe to own channel
    if (currentUser && String(channel.owner?._id || channel.owner) === String(currentUser.id)) {
      return;
    }

    try {
      setSubscribeLoading(true);

      const response = await axios.post(
        `http://localhost:5000/api/channels/${channel._id}/subscribe`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        },
      );

      const data = response.data;

      setSubscribed(Boolean(data.subscribed));

      setSubscriberCount(Number(data.subscriberCount || 0));

      // Keep local channel state updated
      setChannel((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          subscribers: data.subscribed
            ? [...(prev.subscribers || []), currentUser?.id]
            : (prev.subscribers || []).filter(
                (subscriber) =>
                  String(subscriber?._id || subscriber) !==
                  String(currentUser?.id),
              ),
        };
      });
    } catch (err) {
      console.error("Subscribe error:", err);

      alert(err.response?.data?.message || "Unable to update subscription");
    } finally {
      setSubscribeLoading(false);
    }
  }

  // ===============================
  // DELETE VIDEO
  // ===============================
  async function deleteVideo(videoId) {
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      navigate("/signin");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        timeout: 10000,
      });

      setVideos((prevVideos) =>
        prevVideos.filter((video) => video._id !== videoId),
      );

      setShowDeletePopup(false);
      setDeleteVideoId(null);
    } catch (err) {
      console.error("Delete error:", err);

      alert(err.response?.data?.message || "Unable to delete video");
    }
  }

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <div className="channel-error">
        <h2>Loading channel...</h2>
      </div>
    );
  }

  // ===============================
  // ERROR
  // ===============================
  if (error) {
    return (
      <div className="channel-error">
        <h2>{error}</h2>

        <button onClick={loadChannel}>Try Again</button>

        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  // ===============================
  // CHANNEL NOT FOUND
  // ===============================
  if (!channel) {
    return (
      <div className="channel-error">
        <h2>Channel not found</h2>

        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const sortedVideos = getSortedVideos();

  // ===============================
  // CURRENT USER
  // ===============================
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const isChannelOwner =
    currentUser && String(channel.owner?._id || channel.owner) === String(currentUser.id);

  // ===============================
  // AVATAR FALLBACK
  // ===============================
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    channel.name || "User",
  )}&background=333&color=fff&size=200`;

  return (
    <div className="channel-page">
      {/* ================= BANNER ================= */}

      <div className="channel-banner">
        {banner && (
          <img
            src={banner}
            alt="Channel Banner"
            className="channel-banner-image"
          />
        )}

        {isChannelOwner && (
          <label className="banner-camera">
            <MdCameraAlt />

            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              hidden
            />
          </label>
        )}
      </div>

      {/* ================= CHANNEL INFO ================= */}

      <div className="channel-info">
        <img
          className="channel-avatar"
          src={channel.avatar || avatarFallback}
          alt={channel.name}
        />

        <div className="channel-details">
          <h1>{channel.name}</h1>

          <p>{channel.handle}</p>

          <p>
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </p>

          <p className="subscriber-count">
            {subscriberCount}{" "}
            {subscriberCount === 1 ? "subscriber" : "subscribers"}
          </p>

          <p className="channel-description">Welcome to {channel.name}.</p>

          {/* ================= ACTIONS ================= */}

          <div className="channel-owner-actions">
            {!isChannelOwner && (
              <button
                className={`subscribe-button ${subscribed ? "subscribed" : ""}`}
                onClick={handleSubscribe}
                disabled={subscribeLoading}
              >
                {subscribeLoading
                  ? "Please wait..."
                  : subscribed
                    ? "Subscribed"
                    : "Subscribe"}
              </button>
            )}

            {isChannelOwner && (
              <button
                className="add-video-button"
                onClick={() => navigate("/add-video")}
              >
                Upload video
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= CHANNEL TABS ================= */}

      <div className="channel-tabs">
        <button className="active">Home</button>

        <button>Videos</button>

        <button>Shorts</button>

        <button>Live</button>

        <button>Playlists</button>

        <button>Community</button>
      </div>

      {/* ================= SORT ================= */}

      <div className="video-sort">
        <button
          className={sort === "latest" ? "active" : ""}
          onClick={() => setSort("latest")}
        >
          Latest
        </button>

        <button
          className={sort === "popular" ? "active" : ""}
          onClick={() => setSort("popular")}
        >
          Popular
        </button>

        <button
          className={sort === "oldest" ? "active" : ""}
          onClick={() => setSort("oldest")}
        >
          Oldest
        </button>
      </div>

      {/* ================= VIDEOS ================= */}

      <section className="channel-videos">
        <h2>Videos</h2>

        {sortedVideos.length === 0 ? (
          <div className="empty-channel">
            <h3>No videos yet</h3>

            <p>Add a video to your channel.</p>

            {isChannelOwner && (
              <button onClick={() => navigate("/add-video")}>Add Video</button>
            )}
          </div>
        ) : (
          <div className="channel-video-grid">
            {sortedVideos.map((video) => (
              <div className="channel-video-card" key={video._id}>
                <div
                  className="thumbnail-wrapper"
                  onClick={() => navigate(`/watch/${video._id}`)}
                >
                  <img
                    src={video.thumbnail || video.thumbnailUrl}
                    alt={video.title}
                  />
                </div>

                <h3>{video.title}</h3>

                <p>{Number(video.views || 0).toLocaleString()} views</p>

                <p>
                  {video.createdAt
                    ? new Date(video.createdAt).toLocaleDateString()
                    : ""}
                </p>

                {/* OWNER CONTROLS */}

                {isChannelOwner && (
                  <div className="video-actions">
                    <button
                      onClick={() => navigate(`/edit-video/${video._id}`)}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setDeleteVideoId(video._id);

                        setShowDeletePopup(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= DELETE POPUP ================= */}

      {showDeletePopup && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-icon">🗑️</div>

            <h2>Delete video?</h2>

            <p>
              Are you sure you want to delete this video? This action cannot be
              undone.
            </p>

            <div className="delete-modal-actions">
              <button
                className="cancel-delete"
                onClick={() => {
                  setShowDeletePopup(false);
                  setDeleteVideoId(null);
                }}
              >
                Cancel
              </button>

              <button
                className="confirm-delete"
                onClick={() => deleteVideo(deleteVideoId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Channel;
