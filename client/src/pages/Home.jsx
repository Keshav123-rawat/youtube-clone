import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CategoryBar from "../components/CategoryBar";
import VideoGrid from "../components/VideoGrid";

function Home() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <>
      <Navbar
        open={open}
        setOpen={setOpen}
        search={search}
        setSearch={setSearch}
      />
      <div className="home-container">
        <Sidebar open={open} />
        <main className={open ? "main-content expanded" : "main-content"}>
          <CategoryBar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <VideoGrid
            search={search}
            selectedCategory={selectedCategory}
          />
        </main>
      </div>
    </>
  );
}

export default Home;
