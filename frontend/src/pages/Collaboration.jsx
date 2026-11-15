import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Users,
  Trash2,
  Mail,
  ShieldCheck,
  Eye,
  Crown,
  Search,
  X,
  Info,
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
  const [memberSearch, setMemberSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTrips = useCallback(async () => {
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
  }, []);

  const loadMembers = useCallback(async () => {
    if (!tripId) return;
    try {
      setError("");
      const data = await apiRequest(`/collaboration/${tripId}`);
      setOwner(data.owner);
      setMembers(data.members || []);
    } catch (err) {
      setError(err.message);
    }
  }, [tripId]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    if (tripId) loadMembers();
  }, [tripId, loadMembers]);

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

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      setUpdatingRoleId(memberId);
      setError("");
      setSuccess("");

      await apiRequest(`/collaboration/${tripId}/members/${memberId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      setMembers((current) =>
        current.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      setSuccess("Member role updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingRoleId(null);
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

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.user.name?.toLowerCase().includes(q) ||
        m.user.email?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

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
            <p>Invite friends and plan your group travel together.</p>
          </div>
          <Users size={38} />
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

            {/* Role Permissions Reference */}
            <div className="collab-roles-reference">
              <div className="collab-ref-item">
                <Crown size={14} className="crown-icon" />
                <div>
                  <strong>Owner</strong>
                  <p>Trip creator. Can manage members, update trip settings, and delete trip.</p>
                </div>
              </div>
              <div className="collab-ref-item">
                <ShieldCheck size={14} className="editor-icon" />
                <div>
                  <strong>Editor</strong>
                  <p>Can add & modify itinerary activities, log expenses, and update checklists.</p>
                </div>
              </div>
              <div className="collab-ref-item">
                <Eye size={14} className="viewer-icon" />
                <div>
                  <strong>Viewer</strong>
                  <p>Read-only access to view the itinerary schedule, budget, and travel plans.</p>
                </div>
              </div>
            </div>

            {isOwner && (
              <form className="collaboration-invite" onSubmit={handleInvite}>
                <div>
                  <span className="feature-eyebrow">GROW YOUR TRAVEL TEAM</span>
                  <h2>Invite a collaborator</h2>
                  <p>They must already have a registered TripNest account.</p>
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
                    <option value="VIEWER">Viewer (Read-only)</option>
                    <option value="EDITOR">Editor (Can edit)</option>
                  </select>

                  <button className="feature-primary" disabled={submitting}>
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

              {members.length > 2 && (
                <div className="collab-search-wrapper">
                  <Search size={14} className="collab-search-icon" />
                  <input
                    type="text"
                    placeholder="Search members by name or email..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                  {memberSearch && (
                    <button
                      type="button"
                      className="collab-search-clear"
                      onClick={() => setMemberSearch("")}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}

              {/* Owner Display */}
              {owner && (
                <article className="collaboration-member">
                  <div className="collaboration-avatar">
                    {owner.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="collaboration-member-info">
                    <h3>
                      {owner.name} {owner.id === user?.id ? "(You)" : ""}
                    </h3>
                    <p>{owner.email}</p>
                  </div>

                  <span className="collaboration-role owner">
                    <Crown size={14} /> Owner
                  </span>
                </article>
              )}

              {/* Members Display */}
              {filteredMembers.map((member) => (
                <article className="collaboration-member" key={member.id}>
                  <div className="collaboration-avatar">
                    {member.user.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="collaboration-member-info">
                    <h3>{member.user.name}</h3>
                    <p>{member.user.email}</p>
                  </div>

                  {/* Inline role editor for owner, pill for non-owners */}
                  {isOwner ? (
                    <div className="collab-role-selector">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        disabled={updatingRoleId === member.id}
                        aria-label="Change member role"
                        className={`collab-role-dropdown ${member.role.toLowerCase()}`}
                      >
                        <option value="VIEWER">Viewer</option>
                        <option value="EDITOR">Editor</option>
                      </select>
                    </div>
                  ) : (
                    <span className={`collaboration-role ${member.role.toLowerCase()}`}>
                      {member.role === "EDITOR" ? (
                        <ShieldCheck size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                      {member.role}
                    </span>
                  )}

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
                  <p>Invite friends or family to plan this adventure together.</p>
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
