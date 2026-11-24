import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  MapPin,
  Bookmark,
  Calendar,
  DollarSign,
  Compass,
  Plane,
  X,
  Check,
} from "lucide-react";
import { apiRequest } from "../services/api";
import "./FeaturePage.css";

const DESTINATIONS = [
  {
    id: "goa",
    name: "Goa",
    region: "India",
    category: "BEACHES",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    description: "Sun-drenched golden beaches, Portuguese heritage architecture, and vibrant coastal night markets.",
    bestTime: "Nov – Mar",
    dailyBudget: "₹3,000 / day",
    tags: ["Beaches", "Nightlife", "Seafood", "Water Sports"],
  },
  {
    id: "manali",
    name: "Manali & Spiti",
    region: "Himachal Pradesh, India",
    category: "TREKS",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    description: "High mountain passes, pine valleys, Tibetan monasteries, and exhilarating Himalayan adventures.",
    bestTime: "May – Oct",
    dailyBudget: "₹2,500 / day",
    tags: ["Mountains", "Trekking", "Snow", "Monasteries"],
  },
  {
    id: "bali",
    name: "Bali",
    region: "Indonesia",
    category: "BEACHES",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
    description: "Lush green rice terraces, sacred Hindu water temples, world-class surfing, and tropical cliff sunsets.",
    bestTime: "Apr – Oct",
    dailyBudget: "₹4,500 / day",
    tags: ["Tropical", "Temples", "Surfing", "Wellness"],
  },
  {
    id: "kyoto",
    name: "Kyoto",
    region: "Japan",
    category: "CULTURE",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    description: "Ancient wooden shrines, classical zen gardens, traditional tea ceremonies, and bamboo groves.",
    bestTime: "Mar – May & Oct – Nov",
    dailyBudget: "₹7,000 / day",
    tags: ["Heritage", "Shrines", "Cherry Blossoms", "Culinary"],
  },
  {
    id: "swiss-alps",
    name: "Swiss Alps",
    region: "Switzerland",
    category: "TREKS",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800",
    description: "Majestic snow-capped peaks, crystal alpine lakes, scenic cogwheel trains, and charming chalets.",
    bestTime: "Jun – Sep & Dec – Mar",
    dailyBudget: "₹12,000 / day",
    tags: ["Alps", "Skiing", "Scenic Trains", "Hiking"],
  },
  {
    id: "dubai",
    name: "Dubai",
    region: "United Arab Emirates",
    category: "URBAN",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    description: "Futuristic skyscrapers, desert safaris, luxury shopping malls, and world-record marvels.",
    bestTime: "Nov – Mar",
    dailyBudget: "₹8,000 / day",
    tags: ["Skyscrapers", "Desert Safari", "Luxury", "Theme Parks"],
  },
  {
    id: "amalfi",
    name: "Amalfi Coast",
    region: "Italy",
    category: "BEACHES",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800",
    description: "Dramatic coastal cliffs, pastel fishing villages, terraced lemon orchards, and sparkling Mediterranean waters.",
    bestTime: "May – Sep",
    dailyBudget: "₹10,000 / day",
    tags: ["Mediterranean", "Cliffs", "Italian Cuisine", "Romance"],
  },
  {
    id: "paris",
    name: "Paris",
    region: "France",
    category: "CULTURE",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    description: "Iconic art museums, sidewalk bistros, romantic Seine river walks, and world-famous architectural landmarks.",
    bestTime: "Apr – Jun & Sep – Nov",
    dailyBudget: "₹9,500 / day",
    tags: ["Art", "Architecture", "Fine Dining", "Fashion"],
  },
  {
    id: "phuket",
    name: "Phuket & Krabi",
    region: "Thailand",
    category: "BEACHES",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800",
    description: "Limestone karsts rising from emerald waters, island hopping, night street food, and pristine snorkeling reefs.",
    bestTime: "Nov – Apr",
    dailyBudget: "₹3,500 / day",
    tags: ["Island Hopping", "Street Food", "Beaches", "Snorkeling"],
  },
];

const CATEGORIES = [
  { id: "ALL", label: "All Escapes" },
  { id: "BEACHES", label: "Beaches & Islands" },
  { id: "TREKS", label: "Mountains & Treks" },
  { id: "CULTURE", label: "Cultural Heritage" },
  { id: "URBAN", label: "Urban & Nightlife" },
];

export default function Explore() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [savingPlaceId, setSavingPlaceId] = useState(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const data = await apiRequest("/saved-places");
        setSavedPlaces(data.savedPlaces || []);
      } catch (err) {
        // user might be viewing as guest
      }
    };
    fetchSaved();
  }, []);

  const isSaved = (dest) => {
    return savedPlaces.some(
      (p) => p.name === dest.name && p.destination === dest.region
    );
  };

  const handleToggleSave = async (dest) => {
    const existing = savedPlaces.find(
      (p) => p.name === dest.name && p.destination === dest.region
    );

    try {
      setSavingPlaceId(dest.id);
      if (existing) {
        await apiRequest(`/saved-places/${existing.id}`, { method: "DELETE" });
        setSavedPlaces((curr) => curr.filter((p) => p.id !== existing.id));
      } else {
        const data = await apiRequest("/saved-places", {
          method: "POST",
          body: JSON.stringify({
            name: dest.name,
            destination: dest.region,
            description: dest.description,
            imageUrl: dest.image,
          }),
        });
        setSavedPlaces((curr) => [data.savedPlace, ...curr]);
      }
    } catch (err) {
      alert(err.message || "Could not update saved place");
    } finally {
      setSavingPlaceId(null);
    }
  };

  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((dest) => {
      if (selectedCategory !== "ALL" && dest.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = dest.name.toLowerCase().includes(q);
        const matchRegion = dest.region.toLowerCase().includes(q);
        const matchDesc = dest.description.toLowerCase().includes(q);
        const matchTags = dest.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchRegion && !matchDesc && !matchTags) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <main className="feature-page explore-page">
      {/* Header */}
      <header className="feature-header">
        <Link to="/dashboard" className="feature-back">
          <ArrowLeft size={18} /> Dashboard
        </Link>
        <span className="feature-brand">TripNest</span>
      </header>

      <section className="feature-content">
        {/* Title */}
        <div className="feature-title-row">
          <div>
            <span className="feature-eyebrow">WORLDWIDE DESTINATIONS</span>
            <h1>Explore Escapes</h1>
            <p>Discover hand-picked travel destinations, seasonal guides, and inspiration.</p>
          </div>
          <Link to="/dashboard" className="feature-primary">
            <Plane size={16} /> My Trips
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="explore-controls-card">
          <div className="explore-search-input-wrap">
            <Search size={16} className="explore-search-icon" />
            <input
              type="text"
              placeholder="Search by destination, country, tag or activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="explore-search-clear"
                onClick={() => setSearchQuery("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="explore-category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`explore-pill ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="feature-empty">
            <Compass size={36} />
            <h3>No destinations found</h3>
            <p>Try searching for a different keyword or category.</p>
            <button
              type="button"
              className="feature-primary"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="explore-grid">
            {filteredDestinations.map((dest) => {
              const saved = isSaved(dest);
              return (
                <article key={dest.id} className="explore-card">
                  <div className="explore-card-media">
                    <img src={dest.image} alt={dest.name} loading="lazy" />
                    <button
                      type="button"
                      className={`explore-save-badge ${saved ? "saved" : ""}`}
                      onClick={() => handleToggleSave(dest)}
                      disabled={savingPlaceId === dest.id}
                      title={saved ? "Remove from saved places" : "Save to bucket list"}
                      aria-label="Save destination"
                    >
                      <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
                    </button>
                    <span className="explore-category-tag">{dest.category}</span>
                  </div>

                  <div className="explore-card-body">
                    <div className="explore-card-header">
                      <div>
                        <h2>{dest.name}</h2>
                        <span className="explore-region">
                          <MapPin size={13} /> {dest.region}
                        </span>
                      </div>
                    </div>

                    <p className="explore-card-desc">{dest.description}</p>

                    <div className="explore-card-intel">
                      <div className="intel-pill">
                        <Calendar size={13} />
                        <span>Best: {dest.bestTime}</span>
                      </div>
                      <div className="intel-pill">
                        <DollarSign size={13} />
                        <span>Est: {dest.dailyBudget}</span>
                      </div>
                    </div>

                    <div className="explore-tags-row">
                      {dest.tags.map((tag) => (
                        <span key={tag} className="explore-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="explore-card-footer">
                      <Link
                        to={`/dashboard?destination=${encodeURIComponent(dest.name)}`}
                        className="explore-plan-btn"
                      >
                        Plan Trip Here <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
