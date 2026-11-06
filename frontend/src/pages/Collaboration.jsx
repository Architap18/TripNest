
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, UserPlus, Users, Trash2, Mail,
  ShieldCheck, Eye, Crown,
} from "lucide-react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./FeaturePage.css";

function Collaboration() {
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [owner, setOwner] = useState(null);
  const [members, setMembers] = useState([]);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    if (tripId) loadMembers();
  }, [tripId]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/trips");
      const list = data.trips || [];

      setTrips(list);

      if (list.length) setTripId(list[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      setError("");
      const data = await apiRequest(`/collaboration/${tripId}`);
      setOwner(data.owner);
      setMembers(data.members || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const selectedTrip = trips.find((trip) => trip.id === tripId);
  const isOwner = owner?.id === user?.id;

  const handleInvite = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await apiRequest(`/collaboration/${tripId}/invite`, {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });

      setEmail("");
      setRole("VIEWER");
      setSuccess("Member added successfully.");
      await loadMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this trip?`)) return;

    try {
      setError("");
      setSuccess("");

      await apiRequest(
        `/collaboration/${tripId}/members/${memberId}`,
        { method: "DELETE" }
      );

      setMembers((current) =>
        current.filter((member) => member.id !== memberId)
      );

      setSuccess(`${memberName} was removed from the trip.`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="feature-loading">Loading your trips...</div>;
  }

  return (
    <main className="feature-page collaboration-page">
      <header className="feature-header">
        <Link to="/dashboard" className="feature-back">
          <ArrowLeft size={18} /> Dashboard
        </Link>
        <span className="feature-brand">TripNest</span>
      </header>

      <section className="feature-content">
        <div className="feature-title-row">
          <div>
            <span className="feature-eyebrow">TRAVEL TOGETHER</span>
            <h1>Collaborate</h1>
            <p>Invite people and plan your journey together.</p>
          </div>
          <Users size={42} />
        </div>

        <div className="feature-toolbar">
          <label htmlFor="collaboration-trip">Choose a trip</label>
          <select
            id="collaboration-trip"
            value={tripId}
            onChange={(event) => setTripId(event.target.value)}
          >
            {trips.map((trip) => (
              <option value={trip.id} key={trip.id}>
                {trip.title} — {trip.destination}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="feature-error">{error}</p>}
        {success && <p className="feature-success">{success}</p>}

        {!trips.length ? (
          <div className="feature-empty">
            <Users size={36} />
            <h2>No trips available</h2>
            <p>Create a trip before inviting collaborators.</p>
            <Link to="/dashboard">Go to dashboard</Link>
          </div>
        ) : (
          <>
            <div className="feature-trip-banner">
              <div>
                <span>COLLABORATING ON</span>
                <h2>{selectedTrip?.title}</h2>
                <p>{selectedTrip?.destination}</p>
              </div>
              <Users size={35} />
            </div>

            {isOwner && (
              <form className="collaboration-invite" onSubmit={handleInvite}>
                <div>
                  <span className="feature-eyebrow">GROW YOUR TRAVEL TEAM</span>
                  <h2>Invite a collaborator</h2>
                  <p>
                    They must already have a TripNest account.
                  </p>
                </div>

                <label htmlFor="invite-email">Email address</label>
                <div className="collaboration-invite-row">
                  <div className="collaboration-email">
                    <Mail size={17} />
                    <input
                      id="invite-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="friend@example.com"
                      required
                    />
                  </div>

                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    aria-label="Member role"
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="EDITOR">Editor</option>
                  </select>

                  <button
                    className="feature-primary"
                    disabled={submitting}
                  >
                    <UserPlus size={17} />
                    {submitting ? "Adding..." : "Invite"}
                  </button>
                </div>
              </form>
            )}

            <section className="collaboration-members">
              <div className="collaboration-members-heading">
                <div>
                  <h2>Trip members</h2>
                  <p>People who can access this trip.</p>
                </div>
                <span>{members.length + (owner ? 1 : 0)} people</span>
              </div>

              {owner && (
                <article className="collaboration-member">
                  <div className="collaboration-avatar">
                    {owner.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="collaboration-member-info">
                    <h3>{owner.name} {owner.id === user?.id ? "(You)" : ""}</h3>
                    <p>{owner.email}</p>
                  </div>

                  <span className="collaboration-role owner">
                    <Crown size={14} /> Owner
                  </span>
                </article>
              )}

              {members.map((member) => (
                <article className="collaboration-member" key={member.id}>
                  <div className="collaboration-avatar">
                    {member.user.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="collaboration-member-info">
                    <h3>{member.user.name}</h3>
                    <p>{member.user.email}</p>
                  </div>

                  <span className={`collaboration-role ${member.role.toLowerCase()}`}>
                    {member.role === "EDITOR" ? (
                      <ShieldCheck size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                    {member.role}
                  </span>

                  {isOwner && (
                    <button
                      className="collaboration-remove"
                      onClick={() => handleRemove(member.id, member.user.name)}
                      aria-label={`Remove ${member.user.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </article>
              ))}

              {members.length === 0 && (
                <div className="feature-empty">
                  <Users size={30} />
                  <h3>You're planning solo</h3>
                  <p>Invite someone to collaborate on this trip.</p>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default Collaboration;
