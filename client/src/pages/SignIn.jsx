import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SignIn.css";

function SignIn() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  function validateForm() {
    if (isRegister) {
      const cleanUsername = username.trim();

      if (cleanUsername.length < 3) {
        return "Username must be at least 3 characters.";
      }
      if (cleanUsername.length > 30) {
        return "Username must be less than 30 characters.";
      }
      if (!/^[a-zA-Z0-9_ ]+$/.test(cleanUsername)) {
        return "Username can only contain letters, numbers, spaces and underscore.";
      }
    }

    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return "Please enter a valid email address.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (password.length > 50) {
      return "Password must be less than 50 characters.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const response = await axios.post(
          "http://localhost:5000/api/auth/register",
          {
            name: username.trim(),
            email: email.trim().toLowerCase(),
            password,
          },
          { timeout: 10000 },
        );

        setMessage(
          response.data.message || "Registration successful! Please sign in.",
        );
        setMessageType("success");
        setUsername("");
        setEmail("");
        setPassword("");
        setIsRegister(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email.trim().toLowerCase(),
          password,
        },
        { timeout: 10000 },
      );

      if (!response.data.token) {
        throw new Error("Token was not received from the server.");
      }

      localStorage.setItem("token", response.data.token);
      localStorage.removeItem("authToken");

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.user?.id || response.data.user?._id || "",
          name: response.data.user?.name || email.split("@")[0],
          email: response.data.user?.email || email.trim().toLowerCase(),
        }),
      );

      setMessage("Login successful!");
      setMessageType("success");

      setTimeout(() => navigate("/"), 300);
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Server se connection nahi ho raha.",
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister((previous) => !previous);
    setMessage("");
    setMessageType("");
    setUsername("");
    setEmail("");
    setPassword("");
  }

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h1>{isRegister ? "Create your account" : "Sign in"}</h1>

        <p className="signin-subtitle">
          {isRegister
            ? "Create an account to continue"
            : "Sign in to continue to YouTube"}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          <button type="submit" className="signin-submit" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Register" : "Sign In"}
          </button>
        </form>

        {message && (
          <p className={`signin-message ${messageType}`}>{message}</p>
        )}

        <div className="signin-switch">
          <span>
            {isRegister ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button type="button" onClick={switchMode}>
            {isRegister ? "Sign In" : "Register"}
          </button>
        </div>

        <button
          type="button"
          className="back-home"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default SignIn;
