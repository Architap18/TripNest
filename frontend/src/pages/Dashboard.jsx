
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
  CheckCircle2,
  LogOut,
  Bookmark,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";



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



const trips = [
  {
    id: 1,
    name: "Goa Getaway",
    dates: "14 Dec – 18 Dec",
    travelers: 4,
    status: "Upcoming",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900",
  },
  {
    id: 2,
    name: "Manali Trip",
    dates: "02 Jan – 07 Jan",
    travelers: 3,
    status: "Upcoming",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900",
  },
  {
    id: 3,
    name: "Munnar Escape",
    dates: "10 Feb – 14 Feb",
    travelers: 2,
    status: "Planning",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900",
  },
];



const itinerary = [
  {
    day: "Day 1",
    title: "Arrival & Local Exploration",
    place: "Calangute Beach",
    time: "10:00 AM",
    complete: true,
  },
  {
    day: "Day 2",
    title: "Discover Old Goa",
    place: "Basilica of Bom Jesus",
    time: "09:30 AM",
    complete: true,
  },
  {
    day: "Day 3",
    title: "Water Sports & Sunset",
    place: "Baga Beach",
    time: "11:00 AM",
    complete: false,
  },
  {
    day: "Day 4",
    title: "Explore Local Markets",
    place: "Anjuna Flea Market",
    time: "10:00 AM",
    complete: false,
  },
];



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


const activities = [
  {
    title: "You created a new Goa trip",
    detail: "Your travel plan is ready to organize.",
    time: "Recently",
    icon: Plane,
  },
  {
    title: "You added places to your itinerary",
    detail: "3 places were added to your travel plan.",
    time: "Yesterday",
    icon: MapPin,
  },
  {
    title: "Your trip budget was updated",
    detail: "Your travel expenses are being tracked.",
    time: "2 days ago",
    icon: Wallet,
  },
];



function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(
    new Date(2026, 11, 1)
  );
  const [savedDestinations, setSavedDestinations] = useState([]);



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


  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

 

  const toggleSaved = (name) => {
    setSavedDestinations((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  };


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

  const calendarEvents =
    calendarDate.getMonth() === 11 &&
    calendarDate.getFullYear() === 2026
      ? {
          14: "Goa",
          15: "Goa",
          16: "Goa",
          17: "Goa",
          18: "Goa",
        }
      : {};

  return (
    <div className="tripnest-dashboard">


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
          >
            <Bell size={21} />
          </button>

          <div className="tripnest-profile-wrapper">

            <button
              className="tripnest-profile"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="tripnest-avatar">
                {(user?.name || "Traveler")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <span>Hi, {user?.name || "Traveler"}</span>

              <ChevronDown size={17} />
            </button>

            {profileOpen && (
              <div className="tripnest-profile-menu">

                <Link to="/profile">
                  My Profile
                </Link>

                <button onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>

              </div>
            )}

          </div>
        </div>
      </header>

      <main className="tripnest-page">

        {/* =====================================
            HERO CAROUSEL
        ===================================== */}

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

            <Link
              to="/my-trips"
              className="tripnest-hero-button"
            >
              <Plus size={18} />
              Plan a Trip
              <ArrowRight size={17} />
            </Link>

          </div>

          <div className="tripnest-hero-location">
            <MapPin size={15} />
            {slides[activeSlide].location}
          </div>

          <button
            className="tripnest-hero-arrow prev"
            onClick={previousSlide}
            aria-label="Previous photograph"
          >
            <ChevronLeft size={23} />
          </button>

          <button
            className="tripnest-hero-arrow next"
            onClick={nextSlide}
            aria-label="Next photograph"
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
              />
            ))}
          </div>

        </section>

        {/* =====================================
            QUICK ACTIONS
        ===================================== */}

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

              return (
                <Link
                  to={action.path}
                  key={action.title}
                  className={`tripnest-quick-card ${action.color}`}
                >
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
                </Link>
              );
            })}

          </div>
        </section>

        <section className="tripnest-section">

          <div className="tripnest-workspace-grid">

            {/* UPCOMING TRIPS */}

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

                {trips.map((trip) => (
                  <article
                    className="tripnest-trip-row"
                    key={trip.id}
                  >
                    <img src={trip.image} alt={trip.name} />

                    <div className="tripnest-trip-info">
                      <h3>{trip.name}</h3>

                      <p>
                        <CalendarDays size={13} />
                        {trip.dates}
                      </p>

                      <p>
                        <Users size={13} />
                        {trip.travelers} Travelers
                      </p>
                    </div>

                    <span className="tripnest-trip-status">
                      {trip.status}
                    </span>
                  </article>
                ))}

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

                <img
                  src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=500"
                  alt="Manali mountains"
                />

                <div>
                  <h3>Manali Trip</h3>
                  <p>Day 1 of 5</p>

                  <div className="tripnest-progress">
                    <span />
                  </div>
                </div>

                <strong>20%</strong>

              </div>

              <div className="tripnest-itinerary-list">

                {itinerary.map((item) => (
                  <div
                    className="tripnest-itinerary-item"
                    key={item.day}
                  >
                    <div className="tripnest-timeline-dot">
                      {item.complete ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <span />
                      )}
                    </div>

                    <div>
                      <strong>{item.day}</strong>
                      <h4>{item.title}</h4>

                      <p>
                        <MapPin size={12} />
                        {item.place}
                      </p>
                    </div>

                    <small>{item.time}</small>
                  </div>
                ))}

              </div>

              <Link
                to="/itinerary"
                className="tripnest-panel-bottom-link"
              >
                View Full Itinerary
                <ArrowRight size={16} />
              </Link>

            </div>

            {/* TRIP CALENDAR */}

            <div className="tripnest-panel">

              <div className="tripnest-panel-heading">
                <div>
                  <h2>
                    <CalendarDays size={19} />
                    Trip Calendar
                  </h2>
                  <p>Your travel dates</p>
                </div>
              </div>

              <div className="tripnest-calendar-heading">

                <button
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>

                <strong>{monthName}</strong>

                <button
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
                  const event = calendarEvents[day];

                  return (
                    <div
                      className={`tripnest-calendar-day ${
                        event ? "has-event" : ""
                      }`}
                      key={day}
                    >
                      <span>{day}</span>
                      {event && <small>{event}</small>}
                    </div>
                  );
                })}

              </div>

              <div className="tripnest-calendar-legend">
                <span />
                Goa Getaway
              </div>

            </div>

          </div>
        </section>


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

            <Link to="/explore" className="tripnest-view-link">
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

            {activities.map((activity, index) => {
              const Icon = activity.icon;

              return (
                <div
                  className="tripnest-activity-row"
                  key={index}
                >

                  <div className="tripnest-activity-icon">
                    <Icon size={19} />
                  </div>

                  <div>
                    <h3>{activity.title}</h3>
                    <p>{activity.detail}</p>
                  </div>

                  <span>{activity.time}</span>

                </div>
              );
            })}

          </div>
        </section>

        {/* =====================================
            OPTIONAL SAFAR AI ASSISTANT
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

              <button onClick={() => navigate("/explore")}>
                Explore with TripNest AI
                <ArrowRight size={17} />
              </button>

            </div>

            <div className="tripnest-ai-decoration">
              <Compass size={105} />
            </div>

          </div>
        </section>

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
    </div>
  );
}

export default Dashboard;
