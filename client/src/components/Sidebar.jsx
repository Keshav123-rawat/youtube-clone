import {
  MdHomeFilled,
  MdSubscriptions,
  MdOutlineAccountCircle,
  MdHistory,
  MdOutlineWatchLater,
  MdOutlineVideoLibrary,
  MdDownload,
  MdPlaylistPlay,
  MdThumbUpOffAlt,
  MdKeyboardArrowRight,
  MdOutlineShoppingBag,
  MdOutlineMovie,
  MdOutlineKeyboardArrowDown,
  MdOutlineFlag,
} from "react-icons/md";

import { SiYoutubeshorts, SiYoutubemusic } from "react-icons/si";
import { FaYoutube } from "react-icons/fa";
import { IoMusicalNotesOutline } from "react-icons/io5";
import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";

function Sidebar({ open }) {
  const navigate = useNavigate();
  return (
    <aside className={open ? "sidebar expand" : "sidebar"}>
      <div className="sidebar-item active">
        <MdHomeFilled />
        <span>Home</span>
      </div>

      <div className="sidebar-item">
        <SiYoutubeshorts />
        <span>Shorts</span>
      </div>

      <div className="sidebar-item">
        <MdSubscriptions />
        <span>Subscriptions</span>
      </div>

      <div className="sidebar-item" onClick={() => navigate("/my-channel")}>
        <MdOutlineAccountCircle />
        <span>You</span>
      </div>

      {open && (
        <>
          <hr />

          <div className="sidebar-title">
            <span>Subscriptions</span>
            <MdKeyboardArrowRight />
          </div>

          <div className="sidebar-item">
            <img
              src="https://i.pravatar.cc/40"
              alt=""
              className="channel-img"
            />
            <span>tango_devil_yt</span>
          </div>

          <hr />

          <div className="sidebar-title">
            <span>You</span>
            <MdKeyboardArrowRight />
          </div>

          <div className="sidebar-item">
            <MdHistory />
            <span>History</span>
          </div>

          <div className="sidebar-item">
            <MdPlaylistPlay />
            <span>Playlists</span>
          </div>

          <div className="sidebar-item">
            <MdOutlineWatchLater />
            <span>Watch Later</span>
          </div>

          <div className="sidebar-item">
            <MdThumbUpOffAlt />
            <span>Liked Videos</span>
          </div>

          <div className="sidebar-item">
            <MdOutlineVideoLibrary />
            <span>Your Videos</span>
          </div>

          <div className="sidebar-item">
            <MdDownload />
            <span>Downloads</span>
          </div>

          <hr />

          <h3 className="more-title">More from YouTube</h3>

          <div className="sidebar-item">
            <FaYoutube />
            <span>YouTube Premium</span>
          </div>

          <div className="sidebar-item">
            <SiYoutubemusic />
            <span>YouTube Music</span>
          </div>

          <hr />

          <h3 className="more-title">Explore</h3>

          <div className="sidebar-item">
            <MdOutlineShoppingBag />
            <span>Shopping</span>
          </div>

          <div className="sidebar-item">
            <IoMusicalNotesOutline />
            <span>Music</span>
          </div>

          <div className="sidebar-item">
            <MdOutlineMovie />
            <span>Movies & TV</span>
          </div>

          <div className="sidebar-item">
            <MdOutlineKeyboardArrowDown />
            <span>Show more</span>
          </div>

          <hr />

          <div className="sidebar-item">
            <MdOutlineFlag />
            <span>Report history</span>
          </div>

          <hr />

          <div className="footer-links">
            <p>About Press Copyright</p>

            <p>Contact us Creator</p>

            <p>Advertise Developers</p>

            <p>Terms Privacy</p>

            <p>Policy & Safety</p>

            <p>How YouTube works</p>

            <p>Test new features</p>

            <small>© 2026 Google LLC</small>
          </div>
        </>
      )}
    </aside>
  );
}

export default Sidebar;
