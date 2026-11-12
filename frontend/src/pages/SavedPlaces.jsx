
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, MapPin, ArrowLeft } from "lucide-react";
import { apiRequest } from "../services/api";
import "./FeaturePage.css";

const SavedPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/saved-places");
      setPlaces(data.savedPlaces || []);
    } catch (err) {
      setError(err.message || "Could not load saved places.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleRemove = async (id) => {
    try {
      setDeletingId(id);

      await apiRequest(`/saved-places/${id}`, {
        method: "DELETE",
      });

      setPlaces((previous) =>
        previous.filter((place) => place.id !== id)
      );
    } catch (err) {
      setError(err.message || "Could not remove this place.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="saved-loading">
        <div className="saved-spinner" />
        <p>Loading your saved places...</p>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <div className="saved-container">

        <Link to="/dashboard" className="saved-back">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="saved-heading">
          <div>
            <span className="saved-eyebrow">YOUR COLLECTION</span>
            <h1>Saved Places</h1>
            <p>
              All the destinations you've bookmarked in one place.
            </p>
          </div>

          <div className="saved-count">
            <Heart size={19} />
            {places.length} Saved
          </div>
        </div>

        {error && (
          <div className="saved-error">
            {error}
          </div>
        )}

        {places.length === 0 ? (
          <div className="saved-empty">
            <div className="saved-empty-icon">
              <Heart size={34} />
            </div>

            <h2>No saved places yet</h2>

            <p>
              Explore destinations and save the places
              you'd love to visit.
            </p>

            <Link to="/explore" className="saved-explore-btn">
              Explore Destinations
            </Link>
          </div>
        ) : (
          <div className="saved-grid">
            {places.map((place) => (
              <article className="saved-card" key={place.id}>
                <div className="saved-image">
                  {place.imageUrl ? (
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                    />
                  ) : (
                    <div className="saved-no-image">
                      <MapPin size={35} />
                    </div>
                  )}

                  <button
                    type="button"
                    className="saved-remove"
                    onClick={() => handleRemove(place.id)}
                    disabled={deletingId === place.id}
                    aria-label={`Remove ${place.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="saved-card-content">
                  <h3>{place.name}</h3>

                  <p className="saved-location">
                    <MapPin size={15} />
                    {place.destination}
                  </p>

                  {place.description && (
                    <p className="saved-description">
                      {place.description}
                    </p>
                  )}

                  <button
                    type="button"
                    className="saved-remove-text"
                    onClick={() => handleRemove(place.id)}
                    disabled={deletingId === place.id}
                  >
                    {deletingId === place.id
                      ? "Removing..."
                      : "Remove from Saved"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SavedPlaces;
