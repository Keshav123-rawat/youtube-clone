import axios from "axios";
import { FaBars, FaSearch, FaMicrophone, FaBell, FaPlus } from "react-icons/fa";

import {
  MdOutlineAccountCircle,
  MdLogout,
  MdSettings,
  MdLanguage,
  MdKeyboard,
  MdDeleteOutline,
} from "react-icons/md";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Navbar.css";

function Navbar({ open, setOpen, search, setSearch }) {
  const navigate = useNavigate();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);

  const accountRef = useRef(null);

  // Logged-in user
  const savedUser = localStorage.getItem("user");

  const user = savedUser ? JSON.parse(savedUser) : null;

  // Close account menu when clicking outside
  useEffect(() => {
    function handleOutsideClick(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Logout
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    setShowAccountMenu(false);

    navigate("/");

    window.location.reload();
  }

  // DELETE
  async function handleDeleteAccount() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      const response = await axios.delete(
        "http://localhost:5000/api/auth/delete-account",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        },
      );

      const data = response.data;

      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      setShowDeleteAccountPopup(false);

      navigate("/");

      window.location.reload();
    } catch (error) {
      console.error("Delete account error:", error);
    }
  }

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <FaBars className="icon menu" onClick={() => setOpen(!open)} />

        <div className="logo-wrapper" onClick={() => navigate("/")}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
            alt="youtube"
            className="logo"
          />
        </div>
      </div>

      {/* CENTER */}
      <div className="nav-center">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(search.trim());
              }
            }}
            aria-label="Search videos"
          />

          <button
            type="button"
            aria-label="Search"
            onClick={() => {
              if (search.trim()) {
                setSearch(search.trim());
              }
            }}
          >
            <FaSearch />
          </button>
        </div>

        <button className="mic-btn">
          <FaMicrophone />
        </button>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <button
          className="create-btn"
          aria-label={user ? "Create a channel" : "Sign in to create a channel"}
          onClick={() =>
            user ? navigate("/create-channel") : navigate("/signin")
          }
        >
          <FaPlus />
          <span>Create</span>
        </button>

        <button
          type="button"
          className="notification-btn"
          aria-label="Notifications"
        >
          <FaBell className="icon" />
        </button>

        {/* ACCOUNT */}
        {user ? (
          <div className="profile-wrapper" ref={accountRef}>
            <button
              className="profile"
              title={user.name}
              aria-label={`Open account menu for ${user.name || "User"}`}
              aria-expanded={showAccountMenu}
              onClick={() => setShowAccountMenu(!showAccountMenu)}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </button>

            {showAccountMenu && (
              <div className="account-menu">
                {/* USER HEADER */}
                <div className="account-header">
                  <div className="account-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div className="account-user-info">
                    <h3>{user.name || "User"}</h3>

                    <p>{user.email || ""}</p>
                  </div>
                </div>

                <div className="account-divider" />

                {/* CREATE CHANNEL */}
                <button
                  className="account-item channel-create"
                  aria-label="Create a channel"
                  onClick={() => {
                    setShowAccountMenu(false);
                    navigate("/create-channel");
                  }}
                >
                  <MdOutlineAccountCircle />

                  <span>Create a channel</span>
                </button>

                <div className="account-divider" />

                {/* GOOGLE ACCOUNT */}
                <button className="account-item" aria-label="Google Account">
                  <span className="google-icon">G</span>

                  <span>Google Account</span>
                </button>

                {/* SWITCH ACCOUNT */}
                <button className="account-item" aria-label="Switch account">
                  <MdOutlineAccountCircle />

                  <span>Switch account</span>

                  <span className="item-arrow">›</span>
                </button>

                {/* SIGN OUT */}
                <button
                  className="account-item"
                  aria-label="Sign out of your account"
                  onClick={handleLogout}
                >
                  <MdLogout />

                  <span>Sign out</span>
                </button>

                {/* Delete button */}
                <button
                  className="account-item delete-account-item"
                  aria-label="Delete account permanently"
                  onClick={() => {
                    setShowAccountMenu(false);
                    setShowDeleteAccountPopup(true);
                  }}
                >
                  <MdDeleteOutline />

                  <span>Delete permanently</span>
                </button>

                <div className="account-divider" />

                {/* YOUTUBE STUDIO */}
                <button className="account-item" aria-label="YouTube Studio">
                  <MdOutlineAccountCircle />

                  <span>YouTube Studio</span>
                </button>

                {/* PURCHASES */}
                <button
                  className="account-item"
                  aria-label="Purchases and memberships"
                >
                  <span className="money-icon">$</span>

                  <span>Purchases and memberships</span>
                </button>

                <div className="account-divider" />

                {/* DATA */}
                <button
                  className="account-item"
                  aria-label="Your data in YouTube"
                >
                  <MdOutlineAccountCircle />

                  <span>Your data in YouTube</span>
                </button>

                {/* APPEARANCE */}
                <button className="account-item">
                  <span className="moon-icon">◐</span>

                  <span>Appearance: Device theme</span>

                  <span className="item-arrow">›</span>
                </button>

                {/* LANGUAGE */}
                <button className="account-item">
                  <MdLanguage />

                  <span>Display language: English</span>

                  <span className="item-arrow">›</span>
                </button>

                {/* RESTRICTED MODE */}
                <button className="account-item">
                  <MdOutlineAccountCircle />

                  <span>Restricted Mode: Off</span>

                  <span className="item-arrow">›</span>
                </button>

                {/* LOCATION */}
                <button className="account-item">
                  <MdLanguage />

                  <span>Location: India</span>

                  <span className="item-arrow">›</span>
                </button>

                {/* KEYBOARD */}
                <button className="account-item">
                  <MdKeyboard />

                  <span>Keyboard shortcuts</span>
                </button>

                <div className="account-divider" />

                {/* SETTINGS */}
                <button className="account-item">
                  <MdSettings />

                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="signin-btn"
            aria-label="Sign in to your account"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
        )}
      </div>

      {showDeleteAccountPopup && (
        <div className="delete-account-overlay">
          <div className="delete-account-popup">
            <div className="delete-account-icon">
              <MdDeleteOutline />
            </div>

            <h2>Delete account?</h2>

            <p>
              Are you sure you want to permanently delete your account? This
              action cannot be undone.
            </p>

            <div className="delete-account-actions">
              <button
                className="delete-cancel-btn"
                onClick={() => setShowDeleteAccountPopup(false)}
              >
                Cancel
              </button>

              <button
                className="delete-confirm-btn"
                onClick={handleDeleteAccount}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
