import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plane,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarDays,
  Plus,
  Wallet,
  Route,
  UserRoundPlus,
  ArrowRight,
  LogOut,
  Bookmark,
  Sparkles,
  X,
  LoaderCircle,
  BriefcaseBusiness,
  Users,
  Trash2,

} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { apiRequest, API_URL } from "../services/api";
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

// POPULAR DESTINATIONS

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
  {
  name: "Kashmir",
  region: "India",
  image:
    "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=700",
},
];
const parseLocalDate = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};
const formatTripDates = (startDate, endDate) => {
  const options = {
    day: "numeric",
    month: "short",
  };

  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (!start || !end) return "Dates not available";

  const formattedStart = start.toLocaleDateString("en-IN", options);
  const formattedEnd = end.toLocaleDateString("en-IN", options);

  return `${formattedStart} – ${formattedEnd}`;
};

const getTripImage = (trip) => {
  return trip.coverImage || null;
};
// DASHBOARD COMPONENT
const getTimeAgo = (date) => {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";

  return `${days} days ago`;
};
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState("");

  const [trips, setTrips] = useState([]);
  const [activeTripFilter, setActiveTripFilter] = useState("ALL");
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState("");

  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState("");
  const [dashboardItinerary, setDashboardItinerary] = useState([]);

  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [creatingTrip, setCreatingTrip] = useState(false);
  const [createTripError, setCreateTripError] = useState("");
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [tripForm, setTripForm] = useState({
    title: "",
    destination: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
  });
   useEffect(() => {
  let objectUrl;

  const loadAvatar = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/avatar`, {
        credentials: "include",
      });

      if (!response.ok) return;

      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
      setProfileAvatar(objectUrl);
    } catch (error) {
      console.error("Could not load profile picture:", error);
    }
  };

  loadAvatar();

  return () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  };
}, []);
const handleDeleteTrip = async (tripId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this trip? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    await apiRequest(`/trips/${tripId}`, {
      method: "DELETE",
    });

    setTrips((current) =>
      current.filter((trip) => trip.id !== tripId)
    );

    await fetchRecentActivity();
  } catch (error) {
    alert(error.message || "Failed to delete trip.");
  }
};
  // CALENDAR STATE

  const [calendarDate, setCalendarDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  // SAVED DESTINATIONS

  const [savedDestinations, setSavedDestinations] = useState([]);

  // DESTINATION CAROUSEL STATE

  const [activeDestination, setActiveDestination] = useState(0);

  const moveDestination = (direction) => {
    setActiveDestination(
      (current) =>
        (current + direction + destinations.length) % destinations.length
    );
  };

  const visibleDestinations = destinations.map(
    (_, index) =>
      destinations[(index + activeDestination) % destinations.length]
  );

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
// FETCH SAVED DESTINATIONS
const fetchSavedPlaces = async () => {
  try {
    const data = await apiRequest("/saved-places");
    setSavedDestinations(data.savedPlaces || data.places || []);
  } catch (error) {
    console.error("Failed to fetch saved places:", error);
  }
};
// FETCH RECENT ACTIVITY
const fetchRecentActivity = async () => {
  try {
    setActivityLoading(true);
    setActivityError("");

    const data = await apiRequest("/activity");

    setActivities(data.activities || []);
  } catch (error) {
    setActivityError(error.message);
  } finally {
    setActivityLoading(false);
  }
};
  useEffect(() => {
  fetchTrips();
  fetchRecentActivity();
  fetchSavedPlaces();
}, []);

  // FETCH ITINERARY FOR THE FIRST TRIP

  useEffect(() => {
    if (!trips.length) {
      setDashboardItinerary([]);
      return;
    }

    let isActive = true;

    const fetchDashboardItinerary = async () => {
      try {
        setItineraryLoading(true);
        setItineraryError("");

        const data = await apiRequest(`/itinerary/${trips[0].id}`);

        if (isActive) {
          const sortedItems = (data.items || []).sort(
            (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
          );

          setDashboardItinerary(sortedItems);
        }
      } catch (error) {
        if (isActive) {
          setItineraryError(error.message);
        }
      } finally {
        if (isActive) {
          setItineraryLoading(false);
        }
      }
    };

    fetchDashboardItinerary();

    return () => {
      isActive = false;
    };
  }, [trips]);

  // CAROUSEL AUTO SLIDE

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
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
      setCreateTripError("End date cannot be before the start date.");
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
        setTrips((current) => [data.trip, ...current]);
      } else {
        await fetchTrips();
      }
      await fetchRecentActivity();
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
    setCalendarDate(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + amount,
          1
        )
    );
  };

  const monthName = calendarDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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

  // CALENDAR EVENTS

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

// SAVE / REMOVE DESTINATIONS
const toggleSaved = async (destination) => {
  const existingPlace = savedDestinations.find(
    (place) =>
      place.name === destination.name &&
      place.destination === destination.region
  );

  try {
    if (existingPlace) {
      await apiRequest(`/saved-places/${existingPlace.id}`, {
        method: "DELETE",
      });
    } else {
      await apiRequest("/saved-places", {
        method: "POST",
        body: JSON.stringify({
          name: destination.name,
          destination: destination.region,
          description: "",
          imageUrl: destination.image,
        }),
      });
    }

    await fetchSavedPlaces();
  } catch (error) {
    console.error("Failed to update saved places:", error);
    alert(error.message || "Could not update saved places.");
  }
};

// UPCOMING TRIPS

const today = new Date();
today.setHours(0, 0, 0, 0);

const getTripCategory = (trip) => {
  const startDate = parseLocalDate(trip.startDate);
  const endDate = parseLocalDate(trip.endDate);

  if (!startDate || !endDate) {
    return "UNKNOWN";
  }

  if (endDate < today) {
    return "COMPLETED";
  }

  if (startDate > today) {
    return "UPCOMING";
  }

  return "ONGOING";
};

// Upcoming trips only
const upcomingTrips = trips.filter((trip) => {
  return getTripCategory(trip) === "UPCOMING";
});

// Filter trips according to selected tab
const filteredTrips = trips.filter((trip) => {
  if (activeTripFilter === "ALL") {
    return true;
  }

  return getTripCategory(trip) === activeTripFilter;
});

const showAllTrips = () => {
  setActiveTripFilter("ALL");
  document.getElementById("my-trips-section")?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};
  return (
    <div className="tripnest-dashboard">

      {/* NAVBAR */}

      
        <header className="tripnest-navbar">
          <div className="tripnest-navbar-left"></div>
          <Link to="/dashboard" className="tripnest-brand">
            TripNest
          </Link>
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
                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    (user?.name || "Traveler").charAt(0).toUpperCase()
                  )}
                </div>

                <span>Hi, {user?.name || "Traveler"}</span>
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

                  <button type="button" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

      <main className="tripnest-page">

        {/* HERO CAROUSEL */}

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

        {/* FOUR QUICK ACTIONS */}

        <section className="tripnest-section tripnest-top-workspace">
          <div className="tripnest-quick-grid">
            {quickActions.map((action) => {
              const content = (
                <div className="tripnest-quick-text">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
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

        {/* LOWER WORKSPACE */}

        <section className="tripnest-section tripnest-bottom-workspace">

          {/* LEFT SIDE: MY TRIPS + ITINERARY */}

          <div className="tripnest-left-workspace">

            {/* MY TRIPS */}

            <div className="tripnest-my-trips" id="my-trips-section">
              <div className="tripnest-my-trips-heading">
                <h2>My Trips</h2>

                <button type="button" onClick={showAllTrips}>
                  View All <ArrowRight size={16} />
                </button>
              </div>

              <div className="tripnest-trip-filters">
                  {[
                    { label: "All Trips", value: "ALL" },
                    { label: "Upcoming", value: "UPCOMING" },
                    { label: "Ongoing", value: "ONGOING" },
                    { label: "Completed", value: "COMPLETED" },
                  ].map((filter) => (
                    <button
                      type="button"
                      key={filter.value}
                      className={
                        activeTripFilter === filter.value ? "active" : ""
                      }
                      onClick={() => setActiveTripFilter(filter.value)}
                    >
                      {filter.label}
                    </button>
                  ))}
              </div>

              
          <div className="tripnest-my-trip-list">
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

                  <button type="button" onClick={fetchTrips}>
                    Try Again
                  </button>
                </div>
              ) : trips.length === 0 ? (
                <div className="tripnest-empty-state">
                  <h3>No trips yet</h3>
                  <p>Create your first trip and start planning.</p>

                  <button type="button" onClick={openCreateTrip}>
                    <Plus size={16} /> Create a Trip
                  </button>
                </div>
              ) : filteredTrips.length === 0 ? (
                <div className="tripnest-empty-state">
                  <h3>No {activeTripFilter.toLowerCase()} trips</h3>
                  <p>There are no trips in this category yet.</p>
                </div>
              ) : (
                filteredTrips.map((trip) => (
                  <article
                    className="tripnest-my-trip-card"
                    key={trip.id}
                  >
                    <img
                      src={getTripImage(trip)}
                      alt={trip.destination}
                    />

                    <div className="tripnest-my-trip-info">
                      <h3>{trip.title}</h3>

                      <p>
                        <CalendarDays size={15} />
                        {formatTripDates(
                          trip.startDate,
                          trip.endDate
                        )}
                      </p>

                      <p>
                        <MapPin size={15} />
                        {trip.destination}
                      </p>
                    </div>

                    <span className="tripnest-trip-status">
                      {getTripCategory(trip).charAt(0) +
                        getTripCategory(trip).slice(1).toLowerCase()}
                    </span>
                    <button
                      type="button"
                      className="tripnest-trip-delete-icon"
                      onClick={() => handleDeleteTrip(trip.id)}
                      title="Delete trip"
                      aria-label={`Delete ${trip.title}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                ))
              )}
            </div>
            </div>


            {/* MY ITINERARY */}

            <div className="tripnest-panel tripnest-itinerary-panel">
              <div className="tripnest-panel-heading">
                <div>
                  <h2>
                    <Route size={20} />
                    My Itinerary
                  </h2>

                  <p>Your day-wise travel schedule</p>
                </div>

                <Link to="/itinerary">
                  View All <ArrowRight size={15} />
                </Link>
              </div>

              {itineraryLoading ? (
                <div className="tripnest-empty-state">
                  <LoaderCircle size={25} />
                  <p>Loading your itinerary...</p>
                </div>
              ) : itineraryError ? (
                <div className="tripnest-empty-state">
                  <p>{itineraryError}</p>
                </div>
              ) : dashboardItinerary.length > 0 ? (
                <div className="tripnest-dashboard-itinerary-list">
                  {dashboardItinerary.slice(0, 4).map((item) => (
                    <article
                      className="tripnest-dashboard-itinerary-item"
                      key={item.id}
                    >
                      <div className="tripnest-itinerary-item-date">
                        <CalendarDays size={17} />

                        <span>
                          {new Date(item.dateTime).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </span>
                      </div>

                      <div className="tripnest-dashboard-itinerary-info">
                        <h3>{item.title}</h3>

                        <p>
                          {item.category || "ACTIVITY"}
                          {item.location && ` · ${item.location}`}
                        </p>
                      </div>

                      <span className="tripnest-dashboard-itinerary-time">
                        {new Date(item.dateTime).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </article>
                  ))}

                  {dashboardItinerary.length > 4 && (
                    <p className="tripnest-itinerary-more">
                      +{dashboardItinerary.length - 4} more activities
                    </p>
                  )}
                </div>
              ) : (
                <div className="tripnest-empty-state">
                  <Route size={28} />
                  <h3>No activities planned yet</h3>
                  <p>
                    Add activities to your selected trip to see them here.
                  </p>

                  <Link to="/itinerary">
                    Build Itinerary <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>
          </div>
         {/* RIGHT SIDE: UPCOMING TRIP + CALENDAR */}

          <div className="tripnest-right-workspace">

            {/* UPCOMING TRIP */}

            <div className="tripnest-upcoming-feature">
              {upcomingTrips.length > 0 ? (
                <>
                  <img
                    src={getTripImage(upcomingTrips[0])}
                    alt={upcomingTrips[0].destination}
                  />

                  <div className="tripnest-upcoming-overlay">
                    <span>Upcoming Trip</span>
                    <h2>{upcomingTrips[0].destination}</h2>

                    <p>
                      <CalendarDays size={17} />

                      {formatTripDates(
                        upcomingTrips[0].startDate,
                        upcomingTrips[0].endDate
                      )}
                    </p>

                    <Link to="/my-trips">
                      View Details <ArrowRight size={16} />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="tripnest-upcoming-empty">
                  <span>YOUR NEXT ADVENTURE</span>
                  <h2>No upcoming trip</h2>
                  <p>Start planning your next journey.</p>

                  <button type="button" onClick={openCreateTrip}>
                    Plan a Trip <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* TRIP CALENDAR */}

            <div className="tripnest-panel tripnest-calendar-panel">
              <div className="tripnest-panel-heading">
                <h2>
                  <CalendarDays size={20} />
                  Trip Calendar
                </h2>
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
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <span
                      className="tripnest-calendar-weekday"
                      key={day}
                    >
                      {day}
                    </span>
                  )
                )}

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
                    </div>
                  );
                })}
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

              <h2 className="popular-destinations-heading">
                Popular Destinations
              </h2>

              <p className="popular-destinations-subtitle">
                Beautiful places waiting to be explored.
              </p>
            </div>
          </div>

          {/* DESTINATION CAROUSEL */}

          <div className="tripnest-destination-carousel">
            <div className="tripnest-destination-track">
              {visibleDestinations.map((destination, index) => (
                <article
                  className={`tripnest-destination-card position-${index}`}
                  key={destination.name}
                >
                  <div className="tripnest-destination-image">
                    <img
                      src={destination.image}
                      alt={destination.name}
                    />

                    <button
                      type="button"
                      onClick={() => toggleSaved(destination)}
                      aria-label={`Save ${destination.name}`}
                      className={
                          savedDestinations.some(
                            (place) =>
                              place.name === destination.name &&
                              place.destination === destination.region
                          )
                            ? "saved"
                            : ""
                        }
                    >
                      <Bookmark
                        size={19}
                        fill={
                          savedDestinations.some(
                            (place) =>
                              place.name === destination.name &&
                              place.destination === destination.region
                          )
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

            <div className="tripnest-destination-controls">
              <button
                type="button"
                onClick={() => moveDestination(-1)}
                aria-label="Previous destinations"
              >
                <ChevronLeft size={22} />
              </button>

              <span>View More Tours</span>

              <button
                type="button"
                onClick={() => moveDestination(1)}
                aria-label="Next destinations"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section className="tripnest-section tripnest-latest-updates">

          {/* SECTION HEADING */}
          <div className="tripnest-latest-heading">
            <h2>
              Your Latest Updates
            </h2>

            <Link to="/activity">
              View All Activity <ArrowRight size={20} />
            </Link>
          </div>

          <div className="tripnest-updates-layout">

            {/* LEFT: ACTIVITY TIMELINE */}
            <div className="tripnest-activity-panel">

              {activityLoading ? (
                <div className="tripnest-empty-state">
                  <LoaderCircle size={27} />
                  <p>Loading your latest updates...</p>
                </div>
              ) : activityError ? (
                <div className="tripnest-empty-state">
                  <p>{activityError}</p>
                  <button type="button" onClick={fetchRecentActivity}>
                    Try Again
                  </button>
                </div>
              ) : activities.length > 0 ? (

                <div className="tripnest-activity-list">

                  {activities.map((activity, index) => {
                    const isTrip = activity.action.includes("TRIP");
                    const isMember = activity.action.includes("MEMBER");

                    const ActivityIcon = isTrip
                      ? BriefcaseBusiness
                      : isMember
                        ? Users
                        : CalendarDays;

                    return (
                      <article
                        className="tripnest-activity-item"
                        key={activity.id}
                      >

                        <div className="tripnest-timeline-dot">
                          <span />
                        </div>

                        <div
                          className={`tripnest-activity-icon ${
                            isTrip
                              ? "trip-activity"
                              : isMember
                                ? "member-activity"
                                : "itinerary-activity"
                          }`}
                        >
                          <ActivityIcon size={25} />
                        </div>

                        <div className="tripnest-activity-info">

                          <h3>
                            {activity.trip?.title ||
                              activity.details ||
                              activity.action
                                .replaceAll("_", " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (letter) =>
                                  letter.toUpperCase()
                                )}
                          </h3>

                          <p>
                            {activity.details || "Travel planning update"}
                          </p>

                        </div>

                        <time>
                          {getTimeAgo(activity.createdAt)}
                        </time>

                      </article>
                    );
                  })}

                </div>

              ) : (
                <div className="tripnest-empty-state">
                  <CalendarDays size={28} />
                  <h3>No recent activity</h3>
                  <p>Your latest travel updates will appear here.</p>
                </div>
              )}

            </div>

            {/* RIGHT: UPCOMING TRIP */}
            <div className="tripnest-activity-upcoming">

              {upcomingTrips.length > 0 ? (
                <>
                  <div className="tripnest-activity-upcoming-image">
                    <img
                      src={getTripImage(upcomingTrips[0])}
                      alt={upcomingTrips[0].destination}
                    />

                    <span>
                      <MapPin size={17} />
                      {upcomingTrips[0].destination}
                    </span>
                  </div>

                  <div className="tripnest-activity-upcoming-info">

                    <span className="tripnest-upcoming-label">
                      Upcoming Trip
                    </span>

                    <h2>{upcomingTrips[0].title}</h2>

                    <p>
                      <CalendarDays size={19} />
                      {formatTripDates(
                        upcomingTrips[0].startDate,
                        upcomingTrips[0].endDate
                      )}
                    </p>

                    <Link to="/my-trips">
                      View Trip <ArrowRight size={18} />
                    </Link>

                  </div>
                </>
              ) : (
                <div className="tripnest-activity-no-upcoming">
                  <CalendarDays size={32} />
                  <h3>No upcoming trip</h3>
                  <p>Plan your next adventure!</p>

                  <button type="button" onClick={openCreateTrip}>
                    Plan a Trip <ArrowRight size={16} />
                  </button>
                </div>
              )}

            </div>

          </div>
        </section>
        {/* OPTIONAL AI SECTION */}

        <button
            type="button"
            className="tripnest-floating-ai"
            onClick={() => navigate("/explore")}
            aria-label="Chat with TripNest AI"
            title="Chat with TripNest AI"
          >
            <Sparkles size={26} />
          </button>

        {/* FOOTER */}

        <footer className="tripnest-footer">
          <Link to="/dashboard" className="tripnest-brand">
            TripNest
          </Link>

          <p>Made for journeys worth remembering.</p>

          <span>
            2026 TripNest. Explore more, worry less.
          </span>
        </footer>
      </main>

      {/* CREATE TRIP MODAL */}

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

                <p>Add your destination and travel details.</p>
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