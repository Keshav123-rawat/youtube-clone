import "../styles/CategoryBar.css";

const categories = [
  "All",
  "Music",
  "Gaming",
  "React",
  "JavaScript",
  "Live",
  "News",
  "Movies",
  "Podcasts",
  "AI",
  "Programming",
  "MongoDB",
  "CSS",
  "HTML",
  "Coding",
  "Cricket",
  "Football",
  "Comedy",
  "Songs",
];
const uniqueCategories = [...new Set(categories)];

function CategoryBar({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="category-bar" aria-label="Video categories">
      {uniqueCategories.map((item) => (
        <button
          key={item}
          type="button"
          className={selectedCategory === item ? "active-category" : ""}
          onClick={() => setSelectedCategory(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default CategoryBar;
