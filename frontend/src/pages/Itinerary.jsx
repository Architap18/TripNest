import TravelDocuments from "./TravelDocuments";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  CalendarDays,
  Clock,
  Route,
  X,
  Luggage,
  FileText,
  Search,
  Timer,
  Compass,
  Printer,
} from "lucide-react";

import { apiRequest } from "../services/api";
import Packing from "./Packing";
import ItineraryMap from "../components/ItineraryMap";
import PrintableItineraryModal from "../components/PrintableItineraryModal";
import "./FeaturePage.css";

const emptyForm = {
  title: "",
  description: "",
  location: "",
  dateTime: "",
  duration: "",
  category: "SIGHTSEEING",
};

const itineraryCategoryColors = {
  SIGHTSEEING: { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
  FOOD: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  TRANSPORT: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  ACTIVITY: { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff" },
  SHOPPING: { bg: "#fdf2f8", text: "#be185d", border: "#fbcfe8" },
  OTHER: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
};

function Itinerary() {
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [activeTab, setActiveTab] = useState("itinerary");
  const [selectedDayFilter, setSelectedDayFilter] = useState("ALL");
  const [activitySearch, setActivitySearch] = useState("");

  // LOAD TRIPS
  useEffect(() => {
    const loadTrips = async () => {
      try {
        setLoading(true);

        const data = await apiRequest("/trips");
        const list = data.trips || [];

        setTrips(list);

        if (list.length) {
          setTripId(list[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, []);

  // LOAD ITINERARY WHEN TRIP CHANGES
  useEffect(() => {
    if (!tripId) {
      setItems([]);
      return;
    }

    const loadItems = async () => {
      try {
        setError("");

        const data = await apiRequest(`/itinerary/${tripId}`);
        setItems(data.items || []);
      } catch (err) {
        setError(err.message);
      }
    };

    loadItems();
  }, [tripId]);

  const selectedTrip = trips.find((trip) => trip.id === tripId);

  // FILTER ACTIVITIES BY SEARCH
  const filteredItems = useMemo(() => {
    if (!activitySearch.trim()) return items;
    const q = activitySearch.toLowerCase();
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [items, activitySearch]);

  // UNIQUE DATES ORDERED CHRONOLOGICALLY
  const uniqueDates = useMemo(() => {
    const dates = [];
    items.forEach((item) => {
      const date = new Date(item.dateTime).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!dates.includes(date)) dates.push(date);
    });
    return dates;
  }, [items]);

  // GROUP ACTIVITIES BY DATE
  const groupedItems = useMemo(() => {
    return filteredItems.reduce((groups, item) => {
      const date = new Date(item.dateTime).toLocaleDateString(
        "en-IN",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(item);

      return groups;
    }, {});
  }, [filteredItems]);

  // ADD ACTIVITY
  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  };

  // EDIT ACTIVITY
  const openEditForm = (item) => {
    const date = new Date(item.dateTime);

    const localDateTime = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setEditingId(item.id);

    setForm({
      title: item.title,
      description: item.description || "",
      location: item.location || "",
      dateTime: localDateTime,
      duration: item.duration ?? "",
      category: item.category || "SIGHTSEEING",
    });

    setShowForm(true);
    setError("");
  };

  // FORM INPUT CHANGE
  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  // SAVE ACTIVITY
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!tripId) return;

    try {
      setSaving(true);
      setError("");

      const body = {
        ...form,
        duration:
          form.duration === "" ? null : Number(form.duration),
      };

      const endpoint = editingId
        ? `/itinerary/${tripId}/${editingId}`
        : `/itinerary/${tripId}`;

      const data = await apiRequest(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      if (editingId) {
        setItems((current) =>
          current.map((item) =>
            item.id === editingId ? data.item : item
          )
        );
      } else {
        setItems((current) => [...current, data.item]);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      const refreshed = await apiRequest(`/itinerary/${tripId}`);
      setItems(refreshed.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE ACTIVITY
  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete this itinerary activity?")) {
      return;
    }

    try {
      await apiRequest(`/itinerary/${tripId}/${itemId}`, {
        method: "DELETE",
      });

      setItems((current) =>
        current.filter((item) => item.id !== itemId)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="feature-loading">
        Loading your trips...
      </div>
    );
  }

  return (
    <main className="feature-page itinerary-page">
      {/* HEADER */}
      <header className="feature-header">
        <Link to="/dashboard" className="feature-back">
          <ArrowLeft size={18} /> Dashboard
        </Link>

        <span className="feature-brand">TripNest</span>
      </header>

      <section className="feature-content">

        {/* PAGE TITLE */}
        <div className="feature-title-row">
          <div>
            <h1>Build Itinerary</h1>
            <p>Organize your trip one activity at a time.</p>
          </div>

          <div className="feature-title-actions">
            {activeTab === "itinerary" && (
              <>
                <button
                  type="button"
                  className="feature-secondary-btn"
                  onClick={() => setShowPrintModal(true)}
                  disabled={!tripId || !selectedTrip}
                  title="Export or print itinerary"
                >
                  <Printer size={16} /> Export / Print
                </button>
                <button
                  className="feature-primary"
                  onClick={openAddForm}
                  disabled={!tripId}
                >
                  <Plus size={17} /> Add Activity
                </button>
              </>
            )}
          </div>
        </div>

        {/* TRIP SELECTOR */}
        <div className="feature-toolbar">
          <label htmlFor="itinerary-trip">
            Choose a trip
          </label>

          <select
            id="itinerary-trip"
            value={tripId}
            onChange={(event) => {
              setTripId(event.target.value);
              setActiveTab("itinerary");
            }}
          >
            {trips.map((trip) => (
              <option value={trip.id} key={trip.id}>
                {trip.title} — {trip.destination}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="feature-error">{error}</p>
        )}

        {!trips.length ? (
          <div className="feature-empty">
            <Route size={36} />
            <h2>Create a trip first</h2>
            <p>Your itinerary will be attached to a trip.</p>
            <Link to="/dashboard">Go to dashboard</Link>
          </div>
        ) : (
          <>
            {/* SELECTED TRIP BANNER */}
            <div className="feature-trip-banner">
              <div>
                <span>YOUR SELECTED TRIP</span>

                <h2>{selectedTrip?.title}</h2>

                <p>
                  <MapPin size={14} />
                  {selectedTrip?.destination}
                </p>
              </div>

              <CalendarDays size={35} />
            </div>

            {/* WORKSPACE TABS */}
            <div className="trip-workspace-tabs">

              <button
                className={
                  activeTab === "itinerary" ? "active" : ""
                }
                onClick={() => setActiveTab("itinerary")}
              >
                <CalendarDays size={17} />
                Itinerary
              </button>

              <button
                className={
                  activeTab === "packing" ? "active" : ""
                }
                onClick={() => setActiveTab("packing")}
              >
                <Luggage size={17} />
                Packing Checklist
              </button>

              <button
                className={
                  activeTab === "documents" ? "active" : ""
                }
                onClick={() => setActiveTab("documents")}
              >
                <FileText size={17} />
                Travel Documents
              </button>

            </div>

            {/* TAB 1: ITINERARY */}
            {activeTab === "itinerary" && (
              <>
                <ItineraryMap
                  items={items}
                  destination={selectedTrip?.destination || ""}
                />

                {items.length === 0 ? (
                  <div className="feature-empty">
                    <CalendarDays size={36} />

                    <h2>No activities planned yet</h2>

                    <p>
                      Add your first activity to build your schedule.
                    </p>

                    <button
                      className="feature-primary"
                      onClick={openAddForm}
                    >
                      <Plus size={17} /> Add Activity
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="itinerary-filter-bar">
                      <div className="itinerary-search-box">
                        <Search size={15} className="itinerary-search-icon" />
                        <input
                          type="text"
                          placeholder="Search activities, locations, or notes..."
                          value={activitySearch}
                          onChange={(e) => setActivitySearch(e.target.value)}
                        />
                        {activitySearch && (
                          <button
                            type="button"
                            className="itinerary-search-clear"
                            onClick={() => setActivitySearch("")}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      {uniqueDates.length > 1 && (
                        <div className="itinerary-day-chips">
                          <button
                            type="button"
                            className={`itinerary-day-chip ${selectedDayFilter === "ALL" ? "active" : ""}`}
                            onClick={() => setSelectedDayFilter("ALL")}
                          >
                            All Days ({items.length})
                          </button>
                          {uniqueDates.map((date, idx) => {
                            const count = items.filter((it) => {
                              const itDate = new Date(it.dateTime).toLocaleDateString("en-IN", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              });
                              return itDate === date;
                            }).length;
                            return (
                              <button
                                key={date}
                                type="button"
                                className={`itinerary-day-chip ${selectedDayFilter === date ? "active" : ""}`}
                                onClick={() => setSelectedDayFilter(date)}
                              >
                                Day {idx + 1} ({count})
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {filteredItems.length === 0 ? (
                      <div className="feature-empty">
                        <Search size={32} />
                        <h3>No activities match your search</h3>
                        <p>Try searching for a different activity or location.</p>
                        <button
                          className="feature-primary"
                          onClick={() => setActivitySearch("")}
                        >
                          Clear Search
                        </button>
                      </div>
                    ) : (
                      <div className="itinerary-timeline">
                        {Object.entries(groupedItems)
                          .filter(([date]) => selectedDayFilter === "ALL" || selectedDayFilter === date)
                          .map(([date, dayItems]) => {
                            const dayIndex = uniqueDates.indexOf(date);
                            const dayNumber = dayIndex >= 0 ? dayIndex + 1 : 1;
                            const totalMinutes = dayItems.reduce(
                              (sum, it) => sum + (Number(it.duration) || 0),
                              0
                            );
                            const totalHours = Math.floor(totalMinutes / 60);
                            const remainingMins = totalMinutes % 60;

                            return (
                              <section
                                className="itinerary-day"
                                key={date}
                              >
                                <div className="itinerary-day-header">
                                  <div className="itinerary-day-title-row">
                                    <span className="itinerary-day-badge">Day {dayNumber}</span>
                                    <h2>{date}</h2>
                                  </div>
                                  <div className="itinerary-day-meta">
                                    <span className="itinerary-meta-pill">
                                      <Compass size={13} /> {dayItems.length} {dayItems.length === 1 ? "activity" : "activities"}
                                    </span>
                                    {totalMinutes > 0 && (
                                      <span className="itinerary-meta-pill">
                                        <Timer size={13} /> {totalHours > 0 ? `${totalHours}h ` : ""}{remainingMins > 0 ? `${remainingMins}m` : ""} planned
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {dayItems.map((item) => {
                                  const categoryTheme =
                                    itineraryCategoryColors[item.category] ||
                                    itineraryCategoryColors.OTHER;

                                  return (
                                    <article
                                      className="itinerary-item"
                                      key={item.id}
                                    >
                                      <div className="itinerary-time">
                                        <Clock size={15} />

                                        {new Date(
                                          item.dateTime
                                        ).toLocaleTimeString(
                                          "en-IN",
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )}
                                      </div>

                                      <div className="itinerary-item-body">
                                        <span
                                          className="itinerary-category"
                                          style={{
                                            backgroundColor: categoryTheme.bg,
                                            color: categoryTheme.text,
                                            borderColor: categoryTheme.border,
                                          }}
                                        >
                                          {item.category || "ACTIVITY"}
                                        </span>

                                        <h3>{item.title}</h3>

                                        {item.description && (
                                          <p>{item.description}</p>
                                        )}

                                        {item.location && (
                                          <span className="itinerary-location">
                                            <MapPin size={14} />
                                            {item.location}
                                          </span>
                                        )}

                                        {item.duration && (
                                          <span className="itinerary-location">
                                            <Timer size={14} />
                                            {item.duration} minutes
                                          </span>
                                        )}
                                      </div>

                                      {/* EDIT AND DELETE */}
                                      <div className="itinerary-item-actions">
                                        <button
                                          onClick={() => openEditForm(item)}
                                          aria-label="Edit activity"
                                        >
                                          <Pencil size={16} />
                                        </button>

                                        <button
                                          onClick={() => deleteItem(item.id)}
                                          aria-label="Delete activity"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </article>
                                  );
                                })}
                              </section>
                            );
                          })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* TAB 2: PACKING CHECKLIST */}
            {activeTab === "packing" && (
              <Packing
                tripId={tripId}
                tripTitle={selectedTrip?.title}
                destination={selectedTrip?.destination}
              />
            )}

            {/* TAB 3: TRAVEL DOCUMENTS */}
            {activeTab === "documents" && (
              <TravelDocuments tripId={tripId} />
            )}
          </>
        )}
      </section>

      {/* ADD / EDIT ACTIVITY MODAL */}
      {showForm && (
        <div className="feature-modal-backdrop">
          <form
            className="feature-modal"
            onSubmit={handleSubmit}
          >
            <div className="feature-modal-heading">
              <div>
                <span className="feature-eyebrow">
                  {editingId
                    ? "UPDATE YOUR PLAN"
                    : "ADD TO YOUR JOURNEY"}
                </span>

                <h2>
                  {editingId ? "Edit Activity" : "Add Activity"}
                </h2>
              </div>

              <button
                type="button"
                className="feature-close"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <label>Activity title *</label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Visit Baga Beach"
              required
            />

            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="2"
              placeholder="Add some details"
            />

            <label>Location</label>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Baga, Goa"
            />

            <label>Date and time *</label>

            <input
              type="datetime-local"
              name="dateTime"
              value={form.dateTime}
              onChange={handleChange}
              required
            />

            <div className="feature-form-row">
              <div>
                <label>Duration (minutes)</label>

                <input
                  type="number"
                  name="duration"
                  min="1"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="60"
                />
              </div>

              <div>
                <label>Category</label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="SIGHTSEEING">
                    Sightseeing
                  </option>

                  <option value="FOOD">Food</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="ACTIVITY">Activity</option>
                  <option value="SHOPPING">Shopping</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="feature-error">{error}</p>
            )}

            <div className="feature-modal-actions">
              <button
                type="button"
                className="feature-secondary"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="feature-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Activity"}
              </button>
            </div>
          </form>
        </div>
      )}

      <PrintableItineraryModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        trip={selectedTrip}
        items={items}
      />
    </main>
  );
}

export default Itinerary;
