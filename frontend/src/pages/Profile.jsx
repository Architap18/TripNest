
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest, API_URL } from "../services/api";
import { Link } from "react-router-dom";
import {
  User,
  SlidersHorizontal,
  Lock,
  Bell,
  Camera,
  Pencil,
  MapPin,
  Mail,
  Phone,
  CalendarDays,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import "./Profile.css";

const defaultPreferences = {
  travelStyle: "Adventure",
  budget: "Moderate",
  destination: "Mountains",
  interests: ["Nature", "Adventure"],
};

const defaultNotifications = {
  tripUpdates: true,
  itineraryReminders: true,
  collaboration: true,
  promotionalEmails: false,
};

const Profile = () => {
  const { updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("personal");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [avatar, setAvatar] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInput = useRef(null);

  const [cover, setCover] = useState("");
  const [coverLoading, setCoverLoading] = useState(false);
  const coverInput = useRef(null);

  const [message, setMessage] = useState({ type: "", text: "" });

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    location: "",
  });

  const [stats, setStats] = useState({
    tripsPlanned: 0,
    savedPlaces: 0,
    travelBuddies: 0,
    totalExpenses: 0,
  });

  const [preferences, setPreferences] = useState(defaultPreferences);
  const [notifications, setNotifications] = useState(defaultNotifications);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState(false);

  const tabs = [
    { id: "personal", label: "Personal Information", icon: User },
    { id: "preferences", label: "Travel Preferences", icon: SlidersHorizontal },
    { id: "security", label: "Security & Account", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  // Load profile and statistics
  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);

      try {
        const [profileData, statsData] = await Promise.all([
          apiRequest("/profile"),
          apiRequest("/profile/stats"),
        ]);

        if (cancelled) return;

        const data = profileData.profile;

        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth
            ? data.dateOfBirth.slice(0, 10)
            : "",
          location: data.location || "",
        });

        setPreferences({
          ...defaultPreferences,
          ...(data.preferences || {}),
          interests: data.preferences?.interests || [],
        });

        setNotifications({
          ...defaultNotifications,
          ...(data.notificationSettings || {}),
        });

        setStats(
          statsData.stats || {
            tripsPlanned: 0,
            savedPlaces: 0,
            travelBuddies: 0,
            totalExpenses: 0,
          }
        );

        updateUser({
          name: data.name,
          email: data.email,
        });
      } catch (error) {
        if (!cancelled) {
          showMessage("error", error.message || "Could not load profile.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load private avatar
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
        setAvatar(objectUrl);
      } catch (error) {
        console.error("Could not load profile picture:", error);
      }
    };

    loadAvatar();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // Load private cover image
  useEffect(() => {
    let objectUrl;

    const loadCover = async () => {
      try {
        const response = await fetch(`${API_URL}/profile/cover`, {
          credentials: "include",
        });

        if (!response.ok) return;

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setCover(objectUrl);
      } catch (error) {
        console.error("Could not load cover image:", error);
      }
    };

    loadCover();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const handleProfileChange = (e) => {
    setProfile((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // Save personal information
  const handleSaveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      showMessage("error", "Name and email are required.");
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const data = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });

      const updated = data.user;

      setProfile({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        dateOfBirth: updated.dateOfBirth
          ? updated.dateOfBirth.slice(0, 10)
          : "",
        location: updated.location || "",
      });

      updateUser({
        name: updated.name,
        email: updated.email,
      });

      setEditing(false);
      showMessage("success", "Profile updated successfully.");
    } catch (error) {
      showMessage("error", error.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Upload profile picture
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showMessage("error", "Please choose a JPG, PNG or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "Image must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setAvatarLoading(true);

    try {
      await apiRequest("/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const response = await fetch(
        `${API_URL}/profile/avatar?t=${Date.now()}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Picture uploaded, but could not reload it.");
      }

      const blob = await response.blob();
      const newUrl = URL.createObjectURL(blob);

      setAvatar((oldUrl) => {
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        return newUrl;
      });

      showMessage("success", "Profile picture updated.");
    } catch (error) {
      showMessage("error", error.message || "Could not upload picture.");
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  // Upload or replace profile cover image
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showMessage("error", "Choose a JPG, PNG or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "Cover image must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("cover", file);

    setCoverLoading(true);

    try {
      await apiRequest("/profile/cover", {
        method: "POST",
        body: formData,
      });

      const response = await fetch(
        `${API_URL}/profile/cover?t=${Date.now()}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Cover uploaded but could not reload it.");
      }

      const blob = await response.blob();
      const newUrl = URL.createObjectURL(blob);

      setCover((oldUrl) => {
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        return newUrl;
      });

      showMessage("success", "Cover image updated successfully.");
    } catch (error) {
      showMessage("error", error.message || "Could not upload cover.");
    } finally {
      setCoverLoading(false);
      e.target.value = "";
    }
  };

  // Save travel preferences
  const handleSavePreferences = async () => {
    setSaving(true);

    try {
      const data = await apiRequest("/profile/preferences", {
        method: "PUT",
        body: JSON.stringify(preferences),
      });

      setPreferences(data.preferences);
      showMessage("success", "Travel preferences saved successfully.");
    } catch (error) {
      showMessage("error", error.message || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };

  // Save notification settings
  const handleSaveNotifications = async () => {
    setSaving(true);

    try {
      const data = await apiRequest("/profile/notifications", {
        method: "PUT",
        body: JSON.stringify(notifications),
      });

      setNotifications({
        ...defaultNotifications,
        ...data.settings,
      });

      showMessage("success", "Notification settings saved successfully.");
    } catch (error) {
      showMessage("error", error.message || "Could not save notifications.");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirm) {
      showMessage("error", "New passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      showMessage("error", "New password must contain at least 8 characters.");
      return;
    }

    setSaving(true);

    try {
      const data = await apiRequest("/profile/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirm: "",
      });

      showMessage("success", data.message || "Password changed successfully.");
    } catch (error) {
      showMessage("error", error.message || "Could not change password.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleInterest = (interest) => {
    setPreferences((previous) => ({
      ...previous,
      interests: previous.interests.includes(interest)
        ? previous.interests.filter((item) => item !== interest)
        : [...previous.interests, interest],
    }));
  };

  const toggleNotification = (key) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  // Statistics without decorative icons
  const statCards = [
    {
      label: "Trips Planned",
      value: stats.tripsPlanned,
    },
    {
      label: "Saved Places",
      value: stats.savedPlaces,
    },
    {
      label: "Travel Buddies",
      value: stats.travelBuddies,
    },
    {
      label: "Total Expenses",
      value: `₹${Number(stats.totalExpenses || 0).toLocaleString("en-IN")}`,
    },
  ];

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loader"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <a href="/dashboard" className="profile-back-link">
        Back
      </a>
      <div className="profile-container">
        <div className="profile-heading">
          <div>
            <h1>My Profile</h1>
            <p>Manage your personal details and travel preferences.</p>
          </div>
        </div>

        {message.text && (
          <div
            className={`profile-message ${message.type}`}
            role="status"
          >
            {message.text}
            <button
              type="button"
              onClick={() => setMessage({ type: "", text: "" })}
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <p className="profile-sidebar-title">ACCOUNT SETTINGS</p>

            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  type="button"
                  key={tab.id}
                  className={`profile-tab ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMessage({ type: "", text: "" });
                  }}
                >
                  <Icon size={19} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          <main className="profile-main">
            {/* Profile banner */}
            <section className="profile-hero-card">
              <div
                className={`profile-cover ${cover ? "has-cover" : ""}`}
                style={
                  cover
                    ? { backgroundImage: `url("${cover}")` }
                    : undefined
                }
              >
                <button
                  type="button"
                  className="profile-cover-upload"
                  onClick={() => coverInput.current?.click()}
                  disabled={coverLoading}
                >
                  <Camera size={16} />
                  {coverLoading
                    ? "Uploading..."
                    : cover
                      ? "Change Cover"
                      : "Upload Cover"}
                </button>

                <input
                  ref={coverInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={handleCoverChange}
                />
              </div>

              <div className="profile-hero-content">
                <div className="profile-avatar-area">
                  <div className="profile-avatar-large">
                    {avatar ? (
                      <img src={avatar} alt="Profile" />
                    ) : (
                      (profile.name || "T").charAt(0).toUpperCase()
                    )}
                  </div>

                  <button
                    type="button"
                    className="profile-camera-button"
                    aria-label="Change profile picture"
                    disabled={avatarLoading}
                    onClick={() => fileInput.current?.click()}
                  >
                    {avatarLoading ? "..." : <Camera size={17} />}
                  </button>

                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="profile-hero-details">
                  <h2>{profile.name || "Traveler"}</h2>
                  <p>{profile.email}</p>
                  <span>
                    <MapPin size={15} />
                    {profile.location || "Add your location"}
                  </span>
                </div>

                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={() => {
                    setActiveTab("personal");
                    setEditing(true);
                  }}
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
              </div>
            </section>

            {/* Statistics - no icons */}
            <section className="profile-stats-grid">
                  {statCards.map((stat) => (
                    stat.label === "Saved Places" ? (
                      <Link
                        to="/saved-places"
                        className="profile-stat-card"
                        key={stat.label}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div className="profile-stat-content">
                          <h3>{stat.value}</h3>
                          <p>{stat.label}</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="profile-stat-card" key={stat.label}>
                        <div className="profile-stat-content">
                          <h3>{stat.value}</h3>
                          <p>{stat.label}</p>
                        </div>
                      </div>
                    )
                  ))}
                </section>

            {/* Personal Information */}
            {activeTab === "personal" && (
              <section className="profile-content-card">
                <div className="profile-section-heading">
                  <div>
                    <h2>Personal Information</h2>
                    <p>Your basic account details.</p>
                  </div>

                  {!editing && (
                    <button
                      type="button"
                      className="profile-text-button"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil size={15} /> Edit
                    </button>
                  )}
                </div>

                <div className="profile-form-grid">
                  <ProfileField
                    icon={User}
                    label="Full Name"
                    name="name"
                    value={profile.name}
                    editing={editing}
                    onChange={handleProfileChange}
                  />

                  <ProfileField
                    icon={Phone}
                    label="Phone Number"
                    name="phone"
                    value={profile.phone}
                    editing={editing}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                  />

                  <ProfileField
                    icon={Mail}
                    label="Email Address"
                    name="email"
                    value={profile.email}
                    editing={editing}
                    onChange={handleProfileChange}
                    type="email"
                  />

                  <ProfileField
                    icon={MapPin}
                    label="Location"
                    name="location"
                    value={profile.location}
                    editing={editing}
                    onChange={handleProfileChange}
                    placeholder="City, Country"
                  />

                  <ProfileField
                    icon={CalendarDays}
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    editing={editing}
                    onChange={handleProfileChange}
                    type="date"
                  />
                </div>

                {editing && (
                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-cancel-button"
                      onClick={() => {
                        setEditing(false);
                        showMessage("", "");
                      }}
                    >
                      <X size={16} /> Cancel
                    </button>

                    <button
                      type="button"
                      className="profile-save-button"
                      disabled={saving}
                      onClick={handleSaveProfile}
                    >
                      <Save size={16} />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Travel Preferences */}
            {activeTab === "preferences" && (
              <section className="profile-content-card">
                <div className="profile-section-heading">
                  <div>
                    <h2>Travel Preferences</h2>
                    <p>Tell us what your ideal trip looks like.</p>
                  </div>
                </div>

                <div className="profile-preference-group">
                  <label>Preferred Travel Style</label>
                  <div className="profile-choice-grid">
                    {["Adventure", "Relaxation", "Luxury", "Budget"].map(
                      (item) => (
                        <button
                          type="button"
                          key={item}
                          className={
                            preferences.travelStyle === item ? "selected" : ""
                          }
                          onClick={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              travelStyle: item,
                            }))
                          }
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="profile-preference-group">
                  <label>Preferred Budget</label>
                  <div className="profile-choice-grid">
                    {["Budget", "Moderate", "Premium", "Luxury"].map(
                      (item) => (
                        <button
                          type="button"
                          key={item}
                          className={
                            preferences.budget === item ? "selected" : ""
                          }
                          onClick={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              budget: item,
                            }))
                          }
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="profile-preference-group">
                  <label>Favourite Destination Type</label>
                  <div className="profile-choice-grid">
                    {["Mountains", "Beaches", "Cities", "Countryside"].map(
                      (item) => (
                        <button
                          type="button"
                          key={item}
                          className={
                            preferences.destination === item ? "selected" : ""
                          }
                          onClick={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              destination: item,
                            }))
                          }
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="profile-preference-group">
                  <label>Interests</label>
                  <div className="profile-choice-grid">
                    {[
                      "Nature",
                      "Adventure",
                      "Food",
                      "Photography",
                      "Culture",
                      "Shopping",
                    ].map((item) => (
                      <button
                        type="button"
                        key={item}
                        className={
                          preferences.interests.includes(item)
                            ? "selected"
                            : ""
                        }
                        onClick={() => toggleInterest(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="profile-save-button"
                  disabled={saving}
                  onClick={handleSavePreferences}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </section>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <section className="profile-content-card">
                <div className="profile-section-heading">
                  <div>
                    <h2>Security & Account</h2>
                    <p>Keep your TripNest account secure.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                  {[
                    { label: "Current Password", name: "currentPassword" },
                    { label: "New Password", name: "newPassword" },
                    { label: "Confirm New Password", name: "confirm" },
                  ].map((field) => (
                    <div
                      className="profile-password-field"
                      key={field.name}
                    >
                      <label>{field.label}</label>
                      <div>
                        <input
                          type={showPasswords ? "text" : "password"}
                          name={field.name}
                          value={passwords[field.name]}
                          onChange={handlePasswordChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => !prev)
                          }
                          aria-label="Toggle password visibility"
                        >
                          {showPasswords ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={saving}
                  >
                    <Lock size={16} />
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </section>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <section className="profile-content-card">
                <div className="profile-section-heading">
                  <div>
                    <h2>Notifications</h2>
                    <p>Choose which updates you want to receive.</p>
                  </div>
                </div>

                {[
                  {
                    key: "tripUpdates",
                    title: "Trip Updates",
                    desc: "Changes to your trips and bookings.",
                  },
                  {
                    key: "itineraryReminders",
                    title: "Itinerary Reminders",
                    desc: "Reminders about upcoming activities.",
                  },
                  {
                    key: "collaboration",
                    title: "Collaboration",
                    desc: "Invitations and updates from travel buddies.",
                  },
                  {
                    key: "promotionalEmails",
                    title: "Promotional Emails",
                    desc: "Travel inspiration, offers and announcements.",
                  },
                ].map((item) => (
                  <div
                    className="profile-notification-row"
                    key={item.key}
                  >
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications[item.key]}
                      className={`profile-toggle ${
                        notifications[item.key] ? "on" : ""
                      }`}
                      onClick={() => toggleNotification(item.key)}
                    >
                      <span />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="profile-save-button"
                  disabled={saving}
                  onClick={handleSaveNotifications}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Notification Settings"}
                </button>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({
  icon: Icon,
  label,
  name,
  value,
  editing,
  onChange,
  type = "text",
  placeholder = "",
}) => (
  <div className="profile-field">
    <div className="profile-field-label">
      <Icon size={18} />
      <label>{label}</label>
    </div>

    {editing ? (
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
      />
    ) : (
      <div className="profile-field-value">
        {type === "date" && value
          ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : value || "Not added"}
      </div>
    )}
  </div>
);

export default Profile;
