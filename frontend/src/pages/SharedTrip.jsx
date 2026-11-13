import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  Wallet,
  Luggage,
  Compass,
  Printer,
  Copy,
  Check,
  ArrowRight,
  Plane,
  FileText,
  User,
  Share2,
} from "lucide-react";
import { apiRequest } from "../services/api";
import PrintableItineraryModal from "../components/PrintableItineraryModal";
import "./FeaturePage.css";

export default function SharedTrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeTab, setActiveTab] = useState("itinerary");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/trips/${tripId}/summary`);
        setTrip(data.trip);
      } catch (err) {
        setError(err.message || "Failed to load shared trip.");
      } finally {
        setLoading(false);
      }
    };

    if (tripId) fetchSummary();
  }, [tripId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Group itinerary items by date
  const groupedItems = useMemo(() => {
    if (!trip?.itinerary) return {};
    return trip.itinerary.reduce((groups, item) => {
      const date = new Date(item.dateTime).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
      return groups;
    }, {});
  }, [trip]);

  const tripDays = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return null;
    return Math.max(
      1,
      Math.round(
        (new Date(trip.endDate) - new Date(trip.startDate)) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  }, [trip]);

  if (loading) {
    return (
      <div className="shared-trip-loading">
        <Plane size={36} className="shared-plane-spin" />
        <p>Loading travel dossier...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="shared-trip-error-wrap">
        <h2>Trip Not Found</h2>
        <p>{error || "This shared travel plan is unavailable or has been removed."}</p>
        <Link to="/" className="feature-primary">
          Go to TripNest Home
        </Link>
      </div>
    );
  }

  return (
    <div className="shared-trip-page">
      {/* Top Navbar */}
      <header className="shared-trip-navbar">
        <Link to="/" className="shared-brand">
          TripNest
        </Link>
        <div className="shared-navbar-actions">
          <button
            type="button"
            className="shared-action-btn"
            onClick={handleCopyLink}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Link Copied!" : "Share Link"}
          </button>
          <button
            type="button"
            className="shared-action-btn primary"
            onClick={() => setShowPrintModal(true)}
          >
            <Printer size={15} /> Export Dossier
          </button>
          <Link to="/login" className="shared-cta-btn">
            Plan a Trip <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section
        className="shared-hero-banner"
        style={{
          backgroundImage: trip.coverImage
            ? `linear-gradient(180deg, rgba(26, 21, 56, 0.45) 0%, rgba(26, 21, 56, 0.85) 100%), url(${trip.coverImage})`
            : "linear-gradient(135deg, #402697 0%, #211b43 100%)",
        }}
      >
        <div className="shared-hero-content">
          <div className="shared-badge-row">
            <span className="shared-tag">SHARED TRAVEL DOSSIER</span>
            <span className="shared-status-pill">{trip.status}</span>
          </div>
          <h1>{trip.title}</h1>
          <div className="shared-meta-row">
            <span>
              <MapPin size={16} /> {trip.destination}
            </span>
            <span>
              <Calendar size={16} /> {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              {tripDays && ` (${tripDays} Days)`}
            </span>
            <span>
              <User size={16} /> Planned by {trip.ownerName}
            </span>
          </div>
          {trip.description && <p className="shared-desc">{trip.description}</p>}
        </div>
      </section>

      {/* Main Container */}
      <main className="shared-main-container">
        {/* Workspace Tabs */}
        <div className="shared-nav-tabs">
          <button
            type="button"
            className={`shared-tab-btn ${activeTab === "itinerary" ? "active" : ""}`}
            onClick={() => setActiveTab("itinerary")}
          >
            <Compass size={16} /> Itinerary ({trip.itinerary?.length || 0})
          </button>
          <button
            type="button"
            className={`shared-tab-btn ${activeTab === "budget" ? "active" : ""}`}
            onClick={() => setActiveTab("budget")}
          >
            <Wallet size={16} /> Budget Snapshot
          </button>
          <button
            type="button"
            className={`shared-tab-btn ${activeTab === "packing" ? "active" : ""}`}
            onClick={() => setActiveTab("packing")}
          >
            <Luggage size={16} /> Packing Progress ({trip.packingSummary?.percentage || 0}%)
          </button>
        </div>

        {/* TAB 1: ITINERARY */}
        {activeTab === "itinerary" && (
          <div className="shared-itinerary-view">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="feature-empty">
                <Compass size={36} />
                <h3>No activities recorded</h3>
                <p>The planner has not added any activities to this itinerary yet.</p>
              </div>
            ) : (
              <div className="itinerary-timeline">
                {Object.entries(groupedItems).map(([date, dayItems], idx) => (
                  <section className="itinerary-day" key={date}>
                    <div className="itinerary-day-header">
                      <div className="itinerary-day-title-row">
                        <span className="itinerary-day-badge">Day {idx + 1}</span>
                        <h2>{date}</h2>
                      </div>
                      <span className="itinerary-meta-pill">
                        {dayItems.length} activities planned
                      </span>
                    </div>

                    {dayItems.map((item) => (
                      <article className="itinerary-item" key={item.id}>
                        <div className="itinerary-time">
                          <Clock size={15} />
                          {new Date(item.dateTime).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="itinerary-item-body">
                          <span className="itinerary-category">{item.category}</span>
                          <h3>{item.title}</h3>
                          {item.description && <p>{item.description}</p>}
                          {item.location && (
                            <span className="itinerary-location">
                              <MapPin size={14} /> {item.location}
                            </span>
                          )}
                          {item.duration && (
                            <span className="itinerary-location">
                              <Clock size={14} /> {item.duration} mins
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </section>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BUDGET */}
        {activeTab === "budget" && (
          <div className="shared-budget-view">
            <div className="expense-summary-grid">
              <article className="expense-summary-card">
                <span>PLANNED BUDGET</span>
                <strong>
                  {trip.budget
                    ? `${trip.currency || "INR"} ${Number(trip.budget).toLocaleString()}`
                    : "Not specified"}
                </strong>
              </article>
              <article className="expense-summary-card">
                <span>TOTAL ESTIMATED SPEND</span>
                <strong>
                  {trip.currency || "INR"} {trip.expenseSummary?.totalSpent.toLocaleString()}
                </strong>
              </article>
              <article className="expense-summary-card">
                <span>REMAINING BUDGET</span>
                <strong
                  style={{
                    color:
                      trip.expenseSummary?.remaining < 0 ? "#dc2626" : "#059669",
                  }}
                >
                  {trip.expenseSummary?.remaining !== null
                    ? `${trip.currency || "INR"} ${trip.expenseSummary?.remaining.toLocaleString()}`
                    : "Not set"}
                </strong>
              </article>
            </div>
          </div>
        )}

        {/* TAB 3: PACKING */}
        {activeTab === "packing" && (
          <div className="shared-packing-view">
            <div className="packing-analytics-card">
              <div className="packing-progress-header">
                <div className="packing-progress-title">
                  <Luggage size={24} className="packing-progress-icon" />
                  <div>
                    <h3>
                      {trip.packingSummary?.packed} of {trip.packingSummary?.total} items packed
                    </h3>
                    <p>{trip.packingSummary?.percentage}% completed</p>
                  </div>
                </div>
                <div className="packing-progress-percentage">
                  <span className="packing-pct-num">
                    {trip.packingSummary?.percentage}%
                  </span>
                </div>
              </div>
              <div className="packing-progress-bar-wrap">
                <div
                  className="packing-progress-fill full"
                  style={{ width: `${trip.packingSummary?.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Export Modal */}
      <PrintableItineraryModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        trip={trip}
        items={trip.itinerary || []}
      />
    </div>
  );
}
