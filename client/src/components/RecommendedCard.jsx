import { useNavigate } from "react-router-dom";

function RecommendedCard({ video }) {
  const navigate = useNavigate();

  if (!video) return null;

  const videoId = video.videoId || video._id;

  function handleClick() {
    navigate(`/watch/${videoId}`);
  }

  const views = Number(video.views || 0);

  function formatViews(count) {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1).replace(".0", "")}M`;
    }

    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(".0", "")}K`;
    }

    return count.toLocaleString();
  }

  function formatDate(date) {
    if (!date) return "";

    const now = new Date();
    const created = new Date(date);

    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    if (diff < 1) return "today";
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    if (diff < 365) return `${Math.floor(diff / 30)} months ago`;

    return `${Math.floor(diff / 365)} years ago`;
  }

  return (
    <div className="recommended-card" onClick={handleClick}>
      <div className="recommended-thumbnail">
        <img
          src={
            video.thumbnail ||
            "https://placehold.co/320x180/202020/ffffff?text=Video"
          }
          alt={video.title || "Video"}
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/320x180/202020/ffffff?text=Video";
          }}
        />

        {video.duration && (
          <span className="recommended-duration">{video.duration}</span>
        )}
      </div>

      <div className="recommended-info">
        <h3 title={video.title}>{video.title || "Untitled video"}</h3>

        <p className="recommended-channel">
          {video.uploader || video.channelName || "YouTube"}
        </p>

        <p className="recommended-meta">
          {formatViews(views)} views
          {video.createdAt && (
            <>
              {" • "}
              {formatDate(video.createdAt)}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default RecommendedCard;
