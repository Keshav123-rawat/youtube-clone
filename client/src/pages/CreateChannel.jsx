import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/CreateChannel.css";

function CreateChannel() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!token) {
    return (
      <div className="create-channel-page">
        <div className="create-channel-card signin-required">
          <h1>Sign in to create a channel</h1>
          <p>You need to sign in before you can create your YouTube channel.</p>
          <button
            className="create-primary-btn"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const avatarLetter = name.trim().charAt(0).toUpperCase() || "U";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const cleanName = name.trim();
    const cleanHandle = handle.trim().startsWith("@")
      ? handle.trim()
      : `@${handle.trim()}`;

    if (cleanName.length < 2 || cleanHandle.length < 2) {
      setMessage("Please enter a valid channel name and handle.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/channels",
        {
          name: cleanName,
          handle: cleanHandle,
          ...(avatar ? { avatar } : {}),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );

      setMessage(response.data.message || "Channel created successfully!");

      setTimeout(() => {
        navigate("/my-channel");
      }, 500);
    } catch (error) {
      console.error("Channel error:", error);
      setMessage(
        error.response?.data?.message ||
          "Unable to create channel. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setMessage("Please choose an image smaller than 500 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="create-channel-page">
      <div className="create-channel-card">
        <div className="create-channel-header">
          <h1>How you'll appear</h1>
          <p>Choose a name, handle and profile picture for your channel.</p>
        </div>

        <div className="channel-preview">
          <div className="channel-avatar-preview">
            {avatar ? (
              <img
                src={avatar}
                alt="Channel preview"
                className="channel-avatar-preview-image"
              />
            ) : (
              <span>{avatarLetter}</span>
            )}
          </div>

          <div className="preview-text">
            <h3>{name || "Your Channel Name"}</h3>
            <p>
              {handle
                ? handle.startsWith("@")
                  ? handle
                  : `@${handle}`
                : "@YourHandle"}
            </p>
          </div>
        </div>

        <label className="select-picture">
          Select picture
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={handleAvatarChange}
          />
        </label>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Name</label>
            <input
              type="text"
              placeholder="Enter channel name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
            />
            <span>This is the name that will appear on your channel.</span>
          </div>

          <div className="form-group">
            <label className="label">Handle</label>
            <input
              type="text"
              placeholder="@YourHandle"
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/\s/g, ""))}
              maxLength={30}
              required
            />
            <span>Your unique YouTube handle.</span>
          </div>

          <p className="channel-info">
            By creating this channel, you agree to YouTube's Terms of Service.
          </p>

          {message && <p className="channel-message">{message}</p>}

          <div className="channel-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-primary-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateChannel;
