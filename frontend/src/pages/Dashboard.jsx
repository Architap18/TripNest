
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plane,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarDays,
  Users,
  Plus,
  Compass,
  Wallet,
  Route,
  UserRoundPlus,
  ArrowRight,
  LogOut,
  Bookmark,
  Sparkles,
  X,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";
import "./Dashboard.css";

// HERO CAROUSEL DATA

const slides = [
  {
    title: "Explore Incredible India",
    description:
      "Discover destinations, plan trips, build itineraries and make every journey memorable.",
    location: "Dal Lake, Kashmir",
    image:
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1800",
  },
  {
    title: "Find Your Mountain Escape",
    description:
      "Discover breathtaking mountains, peaceful valleys and unforgettable adventures.",
    location: "Himalayas, India",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800",
  },
  {
    title: "Let the Ocean Find You",
    description:
      "Explore beautiful coastlines, tropical beaches and hidden seaside destinations.",
    location: "Tropical Coast",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800",
  },
  {
    title: "Travel Beyond Ordinary",
    description:
      "Experience new cultures, discover beautiful cities and collect memories.",
    location: "Kyoto, Japan",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1800",
  },
];

// QUICK ACTIONS

const quickActions = [
  {
    title: "Plan a Trip",
    description: "Create a new travel plan",
    icon: Plane,
    color: "purple",
    path: "/my-trips",
  },
  {
    title: "Build Itinerary",
    description: "Plan your day-wise activities",
    icon: CalendarDays,
    color: "orange",
    path: "/itinerary",
  },
  {
    title: "Collaborate",
    description: "Invite friends and plan together",
    icon: UserRoundPlus,
    color: "blue",
    path: "/collaboration",
  },
  {
    title: "Track Expenses",
    description: "Manage and split trip costs",
    icon: Wallet,
    color: "pink",
    path: "/expenses",
  },
];

// These are suggestions, not user trip records.

const destinations = [
  {
    name: "Manali",
    region: "Himachal Pradesh",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=700",
  },
  {
    name: "Goa",
    region: "India",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=700",
  },
  {
    name: "Jaipur",
    region: "Rajasthan",
    image:
      "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=700",
  },
  {
    name: "Munnar",
    region: "Kerala",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700",
  },
];

// HELPER FUNCTIONS

const parseLocalDate = (value) => {
  if (!value) return null;

  const dateString = String(value).slice(0, 10);
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const formatTripDates = (startDate, endDate) => {
  const options = {
    day: "numeric",
    month: "short",
  };

  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (!start || !end) return "Dates not available";

  const formattedStart = start.toLocaleDateString(
    "en-IN",
    options
  );

  const formattedEnd = end.toLocaleDateString(
    "en-IN",
    options
  );

  return `${formattedStart} – ${formattedEnd}`;
};

const getTripImage = (trip) => {
  if (trip.coverImage) {
    return trip.coverImage;
  }

  const destination = (trip.destination || "").toLowerCase();

  if (destination.includes("goa")) {
    return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900";
  }

  if (destination.includes("manali")) {
    return "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900";
  }

  if (destination.includes("munnar")) {
    return "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900";
  }

  if (destination.includes("jaipur")) {
    return "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900";
  }

  return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900";
};

const getStatusLabel = (status) => {
  if (!status) return "Planning";

  return status.charAt(0) + status.slice(1).toLowerCase();
};

// DASHBOARD COMPONENT

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // CAROUSEL STATE

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // NAVBAR STATE

  const [profileOpen, setProfileOpen] = useState(false);

  // TRIP STATE

  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState("");

  // CREATE TRIP MODAL STATE

  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [creatingTrip, setCreatingTrip] = useState(false);
  const [createTripError, setCreateTripError] = useState("");

  const [tripForm, setTripForm] = useState({
    title: "",
    destination: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
  });

  // CALENDAR STATE

  const [calendarDate, setCalendarDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  // SAVED DESTINATION STATE

  const [savedDestinations, setSavedDestinations] = useState([]);


  // FETCH TRIPS


  const fetchTrips = async () => {
    try {
      setTripsLoading(true);
      setTripsError("");

      const data = await apiRequest("/trips");

      setTrips(data.trips || []);
    } catch (error) {
      setTripsError(error.message);
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);


  // CAROUSEL AUTO SLIDE


  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setActiveSlide(
      (current) => (current + 1) % slides.length
    );
  };

  const previousSlide = () => {
    setActiveSlide(
      (current) => (current - 1 + slides.length) % slides.length
    );
  };


  // LOGOUT


  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  // CREATE TRIP MODAL

  const openCreateTrip = () => {
    setCreateTripError("");
    setShowCreateTrip(true);
  };

  const closeCreateTrip = () => {
    if (creatingTrip) return;

    setShowCreateTrip(false);
    setCreateTripError("");
  };

  const handleTripFormChange = (event) => {
    const { name, value } = event.target;

    setTripForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateTrip = async (event) => {
    event.preventDefault();

    if (
      tripForm.startDate &&
      tripForm.endDate &&
      tripForm.endDate < tripForm.startDate
    ) {
      setCreateTripError(
        "End date cannot be before the start date."
      );
      return;
    }

    try {
      setCreatingTrip(true);
      setCreateTripError("");

      const requestBody = {
        title: tripForm.title.trim(),
        destination: tripForm.destination.trim(),
        description: tripForm.description.trim() || undefined,
        startDate: tripForm.startDate,
        endDate: tripForm.endDate,
        ...(tripForm.budget !== "" && {
          budget: Number(tripForm.budget),
        }),
      };

      const data = await apiRequest("/trips", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (data.trip) {
        setTrips((current) => [
          data.trip,
          ...current,
        ]);
      } else {
        await fetchTrips();
      }

      setTripForm({
        title: "",
        destination: "",
        description: "",
        startDate: "",
        endDate: "",
        budget: "",
      });

      setShowCreateTrip(false);
    } catch (error) {
      setCreateTripError(error.message);
    } finally {
      setCreatingTrip(false);
    }
  };


  // CALENDAR FUNCTIONS


  const changeMonth = (amount) => {
    setCalendarDate((current) =>
      new Date(
        current.getFullYear(),
        current.getMonth() + amount,
        1
      )
    );
  };

  const monthName = calendarDate.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const firstDay = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth(),
    1
  ).getDay();

  const daysInMonth = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + 1,
    0
  ).getDate();

  // Build calendar events using actual trip dates.

  const calendarEvents = {};

  trips.forEach((trip) => {
    const tripStart = parseLocalDate(trip.startDate);
    const tripEnd = parseLocalDate(trip.endDate);

    if (!tripStart || !tripEnd) return;

    const monthStart = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      1
    );

    const monthEnd = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() + 1,
      0
    );

    const rangeStart =
      tripStart > monthStart ? tripStart : monthStart;

    const rangeEnd =
      tripEnd < monthEnd ? tripEnd : monthEnd;

    if (rangeStart <= rangeEnd) {
      for (
        let day = rangeStart.getDate();
        day <= rangeEnd.getDate();
        day++
      ) {
        calendarEvents[day] = [
          ...(calendarEvents[day] || []),
          trip.destination,
        ];
      }
    }
  });


  // SAVED DESTINATIONS


  const toggleSaved = (name) => {
    setSavedDestinations((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  };

  // FILTER UPCOMING TRIPS

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = trips.filter((trip) => {
    const endDate = parseLocalDate(trip.endDate);

    return endDate && endDate >= today;
  });

  return (
    <div className="tripnest-dashboard">

      {/*NAVBAR */}

      <header className="tripnest-navbar">

        <Link to="/dashboard" className="tripnest-brand">
          TripNest
        </Link>

        <div className="tripnest-search">
          <Search size={19} />

          <input
            type="search"
            placeholder="Search destinations, trips and places..."
          />
        </div>

        <div className="tripnest-navbar-right">

          <button
            className="tripnest-notification"
            aria-label="Notifications"
            type="button"
          >
            <Bell size={21} />
          </button>

          <div className="tripnest-profile-wrapper">

            <button
              className="tripnest-profile"
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="tripnest-avatar">
                {(user?.name || "Traveler")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <span>
                Hi, {user?.name || "Traveler"}
              </span>

              <ChevronDown size={17} />
            </button>

            {profileOpen && (
              <div className="tripnest-profile-menu">

                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                >
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>

              </div>
            )}

          </div>
        </div>
      </header>

      <main className="tripnest-page">

        {/* HERO CAROUSEL*/}

        <section
          className="tripnest-hero"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >

          {slides.map((slide, index) => (
            <div
              key={slide.location}
              className={`tripnest-hero-slide ${
                activeSlide === index ? "active" : ""
              }`}
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            />
          ))}

          <div className="tripnest-hero-overlay" />

          <div className="tripnest-hero-content">

            <span className="tripnest-hero-label">
              EXPLORE. PLAN. TRAVEL.
            </span>

            <h1>{slides[activeSlide].title}</h1>

            <p>{slides[activeSlide].description}</p>

            <button
              type="button"
              onClick={openCreateTrip}
              className="tripnest-hero-button"
            >
              <Plus size={18} />
              Plan a Trip
              <ArrowRight size={17} />
            </button>

          </div>

          <div className="tripnest-hero-location">
            <MapPin size={15} />
            {slides[activeSlide].location}
          </div>

          <button
            className="tripnest-hero-arrow prev"
            onClick={previousSlide}
            aria-label="Previous photograph"
            type="button"
          >
            <ChevronLeft size={23} />
          </button>

          <button
            className="tripnest-hero-arrow next"
            onClick={nextSlide}
            aria-label="Next photograph"
            type="button"
          >
            <ChevronRight size={23} />
          </button>

          <div className="tripnest-hero-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.location}
                className={activeSlide === index ? "active" : ""}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show slide ${index + 1}`}
                type="button"
              />
            ))}
          </div>

        </section>

        {/* QUICK ACTIONS*/}

        <section className="tripnest-section tripnest-quick-section">

          <div className="tripnest-section-heading">

            <span className="tripnest-eyebrow">
              YOUR WORKSPACE
            </span>

            <h2>Everything for your next journey</h2>

            <p>
              Plan, organize and manage your travels in one place.
            </p>

          </div>

          <div className="tripnest-quick-grid">

            {quickActions.map((action) => {
              const Icon = action.icon;

              const content = (
                <>
                  <div className="tripnest-quick-icon">
                    <Icon size={26} />
                  </div>

                  <div className="tripnest-quick-text">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>

                  <ArrowRight
                    size={19}
                    className="tripnest-quick-arrow"
                  />
                </>
              );

              if (action.title === "Plan a Trip") {
                return (
                  <button
                    type="button"
                    key={action.title}
                    className={`tripnest-quick-card ${action.color}`}
                    onClick={openCreateTrip}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  to={action.path}
                  key={action.title}
                  className={`tripnest-quick-card ${action.color}`}
                >
                  {content}
                </Link>
              );
            })}

          </div>
        </section>

        {/* WORKSPACE*/}

        <section className="tripnest-section">

          <div className="tripnest-workspace-grid">

            {/* UPCOMING TRIPS*/}

            <div className="tripnest-panel">

              <div className="tripnest-panel-heading">

                <div>
                  <h2>
                    <Plane size={19} />
                    Upcoming Trips
                  </h2>

                  <p>Your next adventures</p>
                </div>

                <Link to="/my-trips">
                  View All <ArrowRight size={15} />
                </Link>

              </div>

              <div className="tripnest-trip-list">

                {tripsLoading ? (
                  <div className="tripnest-empty-state">
                    <LoaderCircle size={27} />
                    <p>Loading your trips...</p>
                  </div>
                ) : tripsError ? (
                  <div className="tripnest-empty-state">
                    <p className="tripnest-error-message">
                      {tripsError}
                    </p>

                    <button
                      type="button"
                      onClick={fetchTrips}
                    >
                      Try Again
                    </button>
                  </div>
                ) : upcomingTrips.length === 0 ? (
                  <div className="tripnest-empty-state">
                    <Plane size={30} />

                    <h3>No upcoming trips</h3>

                    <p>
                      Create your first trip and start planning
                      your next journey.
                    </p>

                    <button
                      type="button"
                      onClick={openCreateTrip}
                    >
                      <Plus size={16} />
                      Create Your First Trip
                    </button>
                  </div>
                ) : (
                  upcomingTrips.map((trip) => (
                    <article
                      className="tripnest-trip-row"
                      key={trip.id}
                    >
                      <img
                        src={getTripImage(trip)}
                        alt={trip.destination}
                      />

                      <div className="tripnest-trip-info">

                        <h3>{trip.title}</h3>

                        <p>
                          <MapPin size={13} />
                          {trip.destination}
                        </p>

                        <p>
                          <CalendarDays size={13} />
                          {formatTripDates(
                            trip.startDate,
                            trip.endDate
                          )}
                        </p>

                      </div>

                      <span className="tripnest-trip-status">
                        {getStatusLabel(trip.status)}
                      </span>

                    </article>
                  ))
                )}

              </div>

              <Link
                to="/my-trips"
                className="tripnest-panel-bottom-link"
              >
                Explore all your trips
                <ArrowRight size={16} />
              </Link>

            </div>

            {/* MY ITINERARY */}

            <div className="tripnest-panel">

              <div className="tripnest-panel-heading">

                <div>
                  <h2>
                    <Route size={19} />
                    My Itinerary
                  </h2>

                  <p>Your day-wise travel schedule</p>
                </div>

                <Link to="/itinerary">
                  View All <ArrowRight size={15} />
                </Link>

              </div>

              <div className="tripnest-itinerary-summary">
                <div>
                  <h3>Plan your activities</h3>
                  <p>
                    Your trip schedules will appear here once
                    you create an itinerary.
                  </p>
                </div>
              </div>

              <div className="tripnest-empty-state">
                <Route size={28} />

                <h3>No itinerary created</h3>

                <p>
                  Choose a trip and start adding places,
                  activities and schedules.
                </p>

                <Link to="/itinerary">
                  Build Itinerary
                  <ArrowRight size={15} />
                </Link>
              </div>

            </div>

            {/*TRIP CALENDAR */}

            <div className="tripnest-panel">

              <div className="tripnest-panel-heading">

                <div>
                  <h2>
                    <CalendarDays size={19} />
                    Trip Calendar
                  </h2>

                  <p>Your saved travel dates</p>
                </div>

              </div>

              <div className="tripnest-calendar-heading">

                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>

                <strong>{monthName}</strong>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronRight size={18} />
                </button>

              </div>

              <div className="tripnest-calendar-grid">

                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map((day) => (
                  <span
                    className="tripnest-calendar-weekday"
                    key={day}
                  >
                    {day}
                  </span>
                ))}

                {Array.from({ length: firstDay }).map((_, index) => (
                  <span
                    className="tripnest-calendar-empty"
                    key={`empty-${index}`}
                  />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const events = calendarEvents[day] || [];

                  return (
                    <div
                      className={`tripnest-calendar-day ${
                        events.length > 0 ? "has-event" : ""
                      }`}
                      key={day}
                      title={events.join(", ")}
                    >
                      <span>{day}</span>

                      {events.length > 0 && (
                        <small>{events.length} trip</small>
                      )}
                    </div>
                  );
                })}

              </div>

              <div className="tripnest-calendar-legend">
                <span />
                Your saved trip dates
              </div>

            </div>

          </div>
        </section>

        {/* POPULAR DESTINATIONS */}

        <section className="tripnest-section">

          <div className="tripnest-section-heading tripnest-heading-row">

            <div>
              <span className="tripnest-eyebrow">
                FIND YOUR NEXT ESCAPE
              </span>

              <h2>Popular Destinations</h2>

              <p>
                Beautiful places waiting to be explored.
              </p>
            </div>

            <Link
              to="/explore"
              className="tripnest-view-link"
            >
              Explore All <ArrowRight size={16} />
            </Link>

          </div>

          <div className="tripnest-destination-grid">

            {destinations.map((destination) => (
              <article
                className="tripnest-destination-card"
                key={destination.name}
              >

                <div className="tripnest-destination-image">

                  <img
                    src={destination.image}
                    alt={destination.name}
                  />

                  <button
                    type="button"
                    onClick={() => toggleSaved(destination.name)}
                    aria-label={`Save ${destination.name}`}
                    className={
                      savedDestinations.includes(destination.name)
                        ? "saved"
                        : ""
                    }
                  >
                    <Bookmark
                      size={19}
                      fill={
                        savedDestinations.includes(destination.name)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                </div>

                <div className="tripnest-destination-info">

                  <h3>{destination.name}</h3>

                  <p>{destination.region}</p>

                  <Link to="/explore">
                    Explore destination
                    <ArrowRight size={14} />
                  </Link>

                </div>

              </article>
            ))}

          </div>
        </section>

        {/* =====================================
            RECENT ACTIVITY
        ===================================== */}

        <section className="tripnest-section">

          <div className="tripnest-section-heading">

            <span className="tripnest-eyebrow">
              YOUR TRAVEL WORKSPACE
            </span>

            <h2>Recent Activity</h2>

            <p>
              Stay up to date with your latest travel planning.
            </p>

          </div>

          <div className="tripnest-activity-panel">

            <div className="tripnest-empty-state">
              <CalendarDays size={28} />

              <h3>No recent activity</h3>

              <p>
                Your trip planning updates will appear here
                when activity tracking is connected.
              </p>
            </div>

          </div>
        </section>

        {/* =====================================
            OPTIONAL AI SECTION
        ===================================== */}

        <section className="tripnest-section">

          <div className="tripnest-ai-banner">

            <div className="tripnest-ai-content">

              <span>
                <Sparkles size={17} />
                YOUR OPTIONAL TRAVEL COMPANION
              </span>

              <h2>Need a little travel inspiration?</h2>

              <p>
                Get destination ideas, itinerary suggestions and
                travel tips whenever you need a little help
                planning your next journey.
              </p>

              <button
                type="button"
                onClick={() => navigate("/explore")}
              >
                Explore with TripNest AI
                <ArrowRight size={17} />
              </button>

            </div>

            <div className="tripnest-ai-decoration">
              <Compass size={105} />
            </div>

          </div>
        </section>

        {/* =====================================
            FOOTER
        ===================================== */}

        <footer className="tripnest-footer">

          <Link to="/dashboard" className="tripnest-brand">
            TripNest
          </Link>

          <p>Made for journeys worth remembering.</p>

          <span>
            © 2026 TripNest. Explore more, worry less.
          </span>

        </footer>

      </main>

      {/* =====================================
          CREATE TRIP MODAL
      ===================================== */}

      {showCreateTrip && (
        <div
          className="tripnest-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateTrip();
            }
          }}
        >

          <div
            className="tripnest-create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-trip-title"
          >

            <div className="tripnest-modal-heading">

              <div>
                <span className="tripnest-eyebrow">
                  START YOUR JOURNEY
                </span>

                <h2 id="create-trip-title">
                  Create a New Trip
                </h2>

                <p>
                  Add your destination and travel details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateTrip}
                disabled={creatingTrip}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleCreateTrip}>

              <div className="tripnest-form-group">
                <label htmlFor="trip-title">
                  Trip Name *
                </label>

                <input
                  id="trip-title"
                  type="text"
                  name="title"
                  value={tripForm.title}
                  onChange={handleTripFormChange}
                  placeholder="e.g. Goa Getaway"
                  required
                  maxLength={100}
                />
              </div>

              <div className="tripnest-form-group">
                <label htmlFor="trip-destination">
                  Destination *
                </label>

                <input
                  id="trip-destination"
                  type="text"
                  name="destination"
                  value={tripForm.destination}
                  onChange={handleTripFormChange}
                  placeholder="e.g. Goa, India"
                  required
                />
              </div>

              <div className="tripnest-form-group">
                <label htmlFor="trip-description">
                  Description
                </label>

                <textarea
                  id="trip-description"
                  name="description"
                  value={tripForm.description}
                  onChange={handleTripFormChange}
                  placeholder="What are you planning for this trip?"
                  rows={3}
                />
              </div>

              <div className="tripnest-form-row">

                <div className="tripnest-form-group">
                  <label htmlFor="trip-start-date">
                    Start Date *
                  </label>

                  <input
                    id="trip-start-date"
                    type="date"
                    name="startDate"
                    value={tripForm.startDate}
                    onChange={handleTripFormChange}
                    required
                  />
                </div>

                <div className="tripnest-form-group">
                  <label htmlFor="trip-end-date">
                    End Date *
                  </label>

                  <input
                    id="trip-end-date"
                    type="date"
                    name="endDate"
                    value={tripForm.endDate}
                    min={tripForm.startDate || undefined}
                    onChange={handleTripFormChange}
                    required
                  />
                </div>

              </div>

              <div className="tripnest-form-group">
                <label htmlFor="trip-budget">
                  Estimated Budget (₹)
                </label>

                <input
                  id="trip-budget"
                  type="number"
                  name="budget"
                  value={tripForm.budget}
                  onChange={handleTripFormChange}
                  placeholder="e.g. 15000"
                  min="0"
                  step="0.01"
                />
              </div>

              {createTripError && (
                <p className="tripnest-error-message">
                  {createTripError}
                </p>
              )}

              <div className="tripnest-modal-actions">

                <button
                  type="button"
                  className="tripnest-cancel-button"
                  onClick={closeCreateTrip}
                  disabled={creatingTrip}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="tripnest-submit-button"
                  disabled={creatingTrip}
                >
                  {creatingTrip ? (
                    <>
                      <LoaderCircle size={17} />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Trip
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
