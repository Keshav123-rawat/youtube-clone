import "../styles/VideoCard.css";
import { useNavigate } from "react-router-dom";

function VideoCard({ video, onClick }) {
  const navigate = useNavigate();

  function handleClick() {
    if (onClick) {
      onClick();
      return;
    }

    navigate(`/watch/${video.videoId || video._id}`);
  }

  const thumbnail = video.thumbnail
    ? video.thumbnail
    : video.youtubeId
      ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
      : null;

  const channelLogo = video.channelLogo || video.channelAvatar || null;

  return (
    <div
      className="video-card"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="thumbnail-wrapper">
        {thumbnail ? (
          <img
            className="thumbnail"
            src={thumbnail}
            alt={video.title || "Video thumbnail"}
          />
        ) : (
          <div className="thumbnail-placeholder">No thumbnail</div>
        )}

        {video.duration ? (
          <span className="duration">{video.duration}</span>
        ) : null}
      </div>

      <div className="video-info">
        {channelLogo ? (
          <img
            className="channel-logo"
            src={channelLogo}
            alt={video.uploader || "Channel"}
          />
        ) : (
          <div className="channel-logo channel-logo-placeholder">
            {(video.uploader || "U").charAt(0).toUpperCase()}
          </div>
        )}

        <div className="video-details">
          <h4>{video.title || "Untitled video"}</h4>

          <p>{video.uploader || video.channelName || "YouTube"}</p>

          <span>{formatViews(video.views || 0)} views</span>
        </div>
      </div>
    </div>
  );
}

function formatViews(views) {
  const number = Number(views) || 0;

  if (number >= 1000000) {
    return (number / 1000000).toFixed(1).replace(".0", "") + "M";
  }

  if (number >= 1000) {
    return (number / 1000).toFixed(1).replace(".0", "") + "K";
  }

  return number;
}

export default VideoCard;
