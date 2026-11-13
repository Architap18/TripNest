import { useState } from "react";
import {
  Printer,
  X,
  Share2,
  Calendar,
  MapPin,
  Clock,
  Wallet,
  Luggage,
  Check,
  Compass,
  Copy,
} from "lucide-react";

export default function PrintableItineraryModal({
  isOpen,
  onClose,
  trip,
  items,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/itinerary?tripId=${trip.id}`;
    navigator.clipboard.writeText(url).then(() => {
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

  // Group items by date
  const groupedItems = items.reduce((groups, item) => {
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

  const tripDays =
    trip.startDate && trip.endDate
      ? Math.max(
          1,
          Math.round(
            (new Date(trip.endDate) - new Date(trip.startDate)) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      : null;

  return (
    <div className="currency-modal-backdrop printable-modal-backdrop" onClick={onClose}>
      <div
        className="currency-modal-content printable-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="printable-control-bar no-print">
          <div className="printable-bar-title">
            <Printer size={18} />
            <span>Itinerary Export Preview</span>
          </div>
          <div className="printable-bar-actions">
            <button
              type="button"
              className="printable-btn share"
              onClick={handleCopyLink}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Link Copied!" : "Copy Trip Link"}
            </button>
            <button
              type="button"
              className="printable-btn primary"
              onClick={handlePrint}
            >
              <Printer size={15} /> Print / Save as PDF
            </button>
            <button
              type="button"
              className="printable-btn close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* The Printable Document */}
        <div className="printable-document-body" id="printable-trip-dossier">
          {/* Document Header */}
          <header className="print-doc-header">
            <div className="print-brand-badge">
              <span>TRIPNEST · TRAVEL DOSSIER</span>
            </div>
            <h1 className="print-trip-title">{trip.title}</h1>
            <div className="print-trip-meta-row">
              <span className="print-meta-item">
                <MapPin size={14} />
                <strong>{trip.destination}</strong>
              </span>
              <span className="print-meta-item">
                <Calendar size={14} />
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                {tripDays && ` (${tripDays} Days)`}
              </span>
              {trip.budget && (
                <span className="print-meta-item">
                  <Wallet size={14} />
                  Budget: {trip.currency || "INR"} {Number(trip.budget).toLocaleString()}
                </span>
              )}
            </div>
            {trip.description && (
              <p className="print-trip-description">{trip.description}</p>
            )}
          </header>

          {/* Schedule Section */}
          <section className="print-schedule-section">
            <h2 className="print-section-title">
              <Compass size={16} /> Day-by-Day Travel Schedule
            </h2>

            {Object.keys(groupedItems).length === 0 ? (
              <p className="print-empty-note">No activities scheduled yet for this trip.</p>
            ) : (
              <div className="print-days-list">
                {Object.entries(groupedItems).map(([date, dayItems], idx) => (
                  <div key={date} className="print-day-block">
                    <div className="print-day-header">
                      <span className="print-day-number">Day {idx + 1}</span>
                      <h3 className="print-day-date">{date}</h3>
                      <span className="print-day-count">
                        {dayItems.length} {dayItems.length === 1 ? "activity" : "activities"}
                      </span>
                    </div>

                    <table className="print-activities-table">
                      <thead>
                        <tr>
                          <th style={{ width: "90px" }}>Time</th>
                          <th style={{ width: "120px" }}>Category</th>
                          <th>Activity & Details</th>
                          <th style={{ width: "140px" }}>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayItems.map((item) => (
                          <tr key={item.id}>
                            <td className="print-time-col">
                              <Clock size={12} />
                              {new Date(item.dateTime).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td>
                              <span className="print-cat-badge">{item.category}</span>
                            </td>
                            <td>
                              <strong>{item.title}</strong>
                              {item.description && (
                                <p className="print-item-desc">{item.description}</p>
                              )}
                              {item.duration && (
                                <span className="print-duration">
                                  Duration: {item.duration} mins
                                </span>
                              )}
                            </td>
                            <td>
                              {item.location ? (
                                <span className="print-location-text">
                                  <MapPin size={12} /> {item.location}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Document Footer */}
          <footer className="print-doc-footer">
            <div className="print-footer-info">
              <span>Generated with TripNest • Organized Travel</span>
              <span>{new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
            </div>
            <small>
              Keep this travel dossier handy during your trip. Have a safe and memorable journey!
            </small>
          </footer>
        </div>
      </div>
    </div>
  );
}
