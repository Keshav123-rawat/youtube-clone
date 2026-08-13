import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaShare,
  FaDownload,
  FaUser,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import RecommendedCard from "../components/RecommendedCard";
import "../styles/Watch.css";

function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [dbVideo, setDbVideo] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [channel, setChannel] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState(
    "Please sign in to like, comment, subscribe and interact with the community.",
  );

  const viewRecorded = useRef(false);

  function getToken() {
    return localStorage.getItem("token") || localStorage.getItem("authToken");
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }

  function formatCount(count) {
    const value = Number(count) || 0;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(".0", "")}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1).replace(".0", "")}K`;
    return String(value);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setVideoLoading(true);
      setLoadingComments(true);
      setPageError("");

      try {
        let foundVideo = null;

        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          const response = await axios.get(
            `http://localhost:5000/api/videos/${id}`,
            { timeout: 10000 },
          );
          foundVideo = response.data;
        } else {
          const response = await axios.get(
            "http://localhost:5000/api/videos",
            { timeout: 10000 },
          );
          const allVideos = Array.isArray(response.data) ? response.data : [];
          foundVideo = allVideos.find(
            (item) =>
              String(item.videoId) === String(id) ||
              String(item._id) === String(id),
          );
        }

        if (!foundVideo?._id) {
          throw new Error("Video not found");
        }

        if (cancelled) return;

        setDbVideo(foundVideo);
        setLikeCount(foundVideo.likes?.length || 0);
        setDislikeCount(foundVideo.dislikes?.length || 0);

        const channelData = foundVideo.channelId;
        setChannel(channelData && typeof channelData === "object" ? channelData : null);
        setSubscriberCount(channelData?.subscribers?.length || 0);

        const currentUser = getCurrentUser();
        const ownerId = channelData?.owner?._id || channelData?.owner;
        setSubscribed(
          Boolean(
            currentUser?.id &&
              channelData?.subscribers?.some(
                (user) =>
                  String(user?._id || user) === String(currentUser.id),
              ),
          ),
        );

        const token = getToken();

        if (token) {
          try {
            const reactionResponse = await axios.get(
              `http://localhost:5000/api/videos/${foundVideo._id}/reaction`,
              {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
              },
            );

            if (!cancelled) {
              setLiked(Boolean(reactionResponse.data.liked));
              setDisliked(Boolean(reactionResponse.data.disliked));
              setLikeCount(Number(reactionResponse.data.likeCount || 0));
              setDislikeCount(
                Number(reactionResponse.data.dislikeCount || 0),
              );
            }
          } catch (error) {
            if (error.response?.status !== 401) {
              console.error("Reaction loading error:", error);
            }
          }
        }

        if (!viewRecorded.current) {
          viewRecorded.current = true;
          axios
            .post(
              `http://localhost:5000/api/videos/${foundVideo._id}/view`,
            )
            .then((response) => {
              if (!cancelled) {
                setDbVideo((previous) =>
                  previous
                    ? { ...previous, views: response.data.views }
                    : previous,
                );
              }
            })
            .catch((error) => {
              console.error("View count error:", error);
            });
        }

        const allResponse = await axios.get(
          "http://localhost:5000/api/videos",
        );
        const allVideos = Array.isArray(allResponse.data)
          ? allResponse.data
          : [];

        if (!cancelled) {
          setRecommendedVideos(
            allVideos.filter(
              (item) => String(item._id) !== String(foundVideo._id),
            ),
          );
        }

        const commentsResponse = await axios.get(
          `http://localhost:5000/api/comments/${foundVideo._id}`,
        );

        if (!cancelled) {
          setComments(
            Array.isArray(commentsResponse.data)
              ? commentsResponse.data
              : [],
          );
        }
      } catch (error) {
        console.error("Watch page error:", error);
        if (!cancelled) {
          setDbVideo(null);
          setPageError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load video.",
          );
        }
      } finally {
        if (!cancelled) {
          setVideoLoading(false);
          setLoadingComments(false);
        }
      }
    }

    if (id) loadPage();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function reactToVideo(reaction) {
    const token = getToken();

    if (!token) {
      setPopupMessage("Please sign in to like or dislike this video.");
      setShowLoginPopup(true);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/videos/${dbVideo._id}/reaction`,
        { reaction },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );

      setLiked(Boolean(response.data.liked));
      setDisliked(Boolean(response.data.disliked));
      setLikeCount(Number(response.data.likeCount || 0));
      setDislikeCount(Number(response.data.dislikeCount || 0));
    } catch (error) {
      console.error(`${reaction} error:`, error);
      if (error.response?.status === 401) {
        setPopupMessage("Your session has expired. Please sign in again.");
        setShowLoginPopup(true);
      } else {
        setPageError(
          error.response?.data?.message ||
            `Unable to ${reaction} this video right now.`,
        );
      }
    }
  }

  async function handleSubscribe() {
    const token = getToken();

    if (!token) {
      setPopupMessage("Please sign in to subscribe to this channel.");
      setShowLoginPopup(true);
      return;
    }

    if (!channel?._id) return;

    const currentUser = getCurrentUser();
    const ownerId = channel.owner?._id || channel.owner;

    if (currentUser?.id && String(ownerId) === String(currentUser.id)) {
      return;
    }

    try {
      setSubscribeLoading(true);

      const response = await axios.post(
        `http://localhost:5000/api/channels/${channel._id}/subscribe`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );

      setSubscribed(Boolean(response.data.subscribed));
      setSubscriberCount(Number(response.data.subscriberCount || 0));

      setChannel((previous) =>
        previous
          ? {
              ...previous,
              subscribers: response.data.subscribed
                ? [
                    ...(previous.subscribers || []),
                    currentUser?.id,
                  ]
                : (previous.subscribers || []).filter(
                    (user) =>
                      String(user?._id || user) !== String(currentUser?.id),
                  ),
            }
          : previous,
      );
    } catch (error) {
      console.error("Subscribe error:", error);
      setPageError(
        error.response?.data?.message ||
          "Unable to update subscription right now.",
      );
    } finally {
      setSubscribeLoading(false);
    }
  }

  async function addComment() {
    if (!comment.trim()) return;

    const token = getToken();

    if (!token) {
      setPopupMessage("Please sign in to comment on this video.");
      setShowLoginPopup(true);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/comments",
        {
          videoId: dbVideo._id,
          text: comment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );

      setComments((previous) => [response.data.comment, ...previous]);
      setComment("");
    } catch (error) {
      console.error("Add comment error:", error);
      setPageError(
        error.response?.data?.message || "Unable to add comment.",
      );
    }
  }

  async function updateComment(commentId) {
    if (!editingText.trim()) return;

    const token = getToken();

    if (!token) {
      setPopupMessage("Please sign in to edit your comment.");
      setShowLoginPopup(true);
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/comments/${commentId}`,
        { text: editingText.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );

      setComments((previous) =>
        previous.map((item) =>
          item._id === commentId ? response.data.comment : item,
        ),
      );
      setEditingId(null);
      setEditingText("");
    } catch (error) {
      console.error("Update comment error:", error);
      setPageError(
        error.response?.data?.message || "Unable to update comment.",
      );
    }
  }

  async function deleteComment(commentId) {
    const token = getToken();

    if (!token) {
      setPopupMessage("Please sign in to delete your comment.");
      setShowLoginPopup(true);
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );

      setComments((previous) =>
        previous.filter((item) => item._id !== commentId),
      );
    } catch (error) {
      console.error("Delete comment error:", error);
      setPageError(
        error.response?.data?.message || "Unable to delete comment.",
      );
    }
  }

  async function shareVideo() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: dbVideo?.title || "YouTube Clone video",
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setPageError("Video link copied to clipboard.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  }

  function downloadVideo() {
    if (dbVideo?.videoUrl) {
      window.open(dbVideo.videoUrl, "_blank", "noopener,noreferrer");
    }
  }

  if (videoLoading) {
    return (
      <div className="watch-status">
        <h2>Loading video...</h2>
      </div>
    );
  }

  if (!dbVideo) {
    return (
      <div className="watch-status">
        <h2>{pageError || "Video not found"}</h2>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const currentUser = getCurrentUser();

  return (
    <>
      <Navbar open={open} setOpen={setOpen} />

      <div className="watch-page">
        <div className="watch-left">
          <div className="video-player">
            {videoLoading && (
              <div className="video-loading">
                <div className="loading-spinner"></div>
                <span>Loading...</span>
              </div>
            )}

            {dbVideo.youtubeId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${dbVideo.youtubeId}`}
                title={dbVideo.title || "YouTube video"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setVideoLoading(false)}
              />
            ) : (
              <div className="video-error">YouTube video is not available.</div>
            )}
          </div>

          <h2>{dbVideo.title}</h2>

          <div className="watch-actions">
            <div className="channel-section">
              <img
                src={
                  channel?.avatar ||
                  "https://ui-avatars.com/api/?name=Channel&background=333&color=fff"
                }
                alt={channel?.name || dbVideo.channelName || "Channel"}
                className="watch-channel"
              />

              <div>
                <p>
                  {channel?.name || dbVideo.channelName || "YouTube"} •{" "}
                  {formatCount(subscriberCount)} subscribers
                </p>
              </div>

              {channel?._id && (
                <button
                  className={`subscribe-btn ${subscribed ? "subscribed" : ""}`}
                  onClick={handleSubscribe}
                  disabled={
                    subscribeLoading ||
                    String(channel.owner?._id || channel.owner) ===
                      String(currentUser?.id)
                  }
                >
                  {subscribeLoading
                    ? "Please wait..."
                    : subscribed
                      ? "Subscribed"
                      : "Subscribe"}
                </button>
              )}
            </div>

            <div className="action-buttons">
              <button
                className={`action-btn ${liked ? "liked" : ""}`}
                onClick={() => reactToVideo("like")}
              >
                <FaThumbsUp className="thumb-icon" />
                <span>{formatCount(likeCount)}</span>
              </button>

              <button
                className={`action-btn ${disliked ? "disliked" : ""}`}
                onClick={() => reactToVideo("dislike")}
              >
                <FaThumbsDown className="thumb-icon" />
                <span>{formatCount(dislikeCount)}</span>
              </button>

              <button onClick={shareVideo}>
                <FaShare />
                Share
              </button>

              <button onClick={downloadVideo}>
                <FaDownload />
                Open
              </button>
            </div>
          </div>

          <div className="video-description">
            <p className="video-meta">
              {formatCount(dbVideo.views)} views •{" "}
              {dbVideo.createdAt
                ? new Date(dbVideo.createdAt).toLocaleDateString()
                : ""}
            </p>
            <p>{dbVideo.description}</p>
          </div>

          {pageError && <p className="watch-inline-message">{pageError}</p>}

          <section className="comments-section">
            <h3>{comments.length} Comments</h3>

            <div className="comment-input">
              <img
                src={
                  currentUser?.avatar ||
                  "https://i.pravatar.cc/80?img=12"
                }
                alt="profile"
                className="comment-avatar"
              />

              <input
                type="text"
                placeholder={
                  getToken() ? "Add a comment..." : "Sign in to comment..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addComment();
                }}
              />

              <button onClick={addComment}>Comment</button>
            </div>

            <div className="comments-list">
              {loadingComments ? (
                <p>Loading comments...</p>
              ) : comments.length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                comments.map((item) => {
                  const commentOwnerId =
                    item.userId?._id || item.userId;
                  const isCommentOwner =
                    currentUser?.id &&
                    String(commentOwnerId) === String(currentUser.id);

                  return (
                    <div className="comment-item" key={item._id}>
                      <img
                        src="https://i.pravatar.cc/80?img=12"
                        alt="profile"
                        className="comment-avatar"
                      />

                      <div className="comment-content">
                        <div className="comment-header">
                          <strong>{item.userId?.name || "User"}</strong>
                          <span>
                            •{" "}
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>

                        {editingId === item._id ? (
                          <div className="edit-comment">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) =>
                                setEditingText(e.target.value)
                              }
                            />
                            <button
                              onClick={() => updateComment(item._id)}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditingText("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p>{item.text}</p>
                        )}

                        {isCommentOwner && editingId !== item._id && (
                          <div className="comment-actions">
                            <button
                              onClick={() => {
                                setEditingId(item._id);
                                setEditingText(item.text);
                              }}
                            >
                              Edit
                            </button>
                            <button onClick={() => deleteComment(item._id)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <div className="watch-right">
          {recommendedVideos.map((item) => (
            <RecommendedCard key={item._id} video={item} />
          ))}
        </div>
      </div>

      {showLoginPopup && (
        <div
          className="login-popup-overlay"
          onClick={() => setShowLoginPopup(false)}
        >
          <div className="login-popup" onClick={(e) => e.stopPropagation()}>
            <button
              className="login-popup-close"
              onClick={() => setShowLoginPopup(false)}
            >
              ×
            </button>

            <div className="login-popup-icon">
              <FaUser />
            </div>

            <h2>Sign in to continue</h2>
            <p>{popupMessage}</p>

            <button
              className="login-popup-btn"
              onClick={() => {
                setShowLoginPopup(false);
                navigate("/signin");
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Watch;
