import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Luggage,
  Check,
  Sparkles,
  CheckCheck,
  RotateCcw,
  X,
  ArrowLeft,
  Search,
  Layers,
  ChevronRight,
  AlertCircle,
  PartyPopper,
} from "lucide-react";
import { apiRequest } from "../services/api";
import { PACKING_TEMPLATES } from "../data/packingTemplates";

const categories = [
  "CLOTHING",
  "TOILETRIES",
  "DOCUMENTS",
  "ELECTRONICS",
  "MEDICINE",
  "OTHER",
];

const categoryLabels = {
  CLOTHING: "Clothing",
  TOILETRIES: "Toiletries",
  DOCUMENTS: "Documents",
  ELECTRONICS: "Electronics",
  MEDICINE: "Medicine",
  OTHER: "Essentials & Other",
};

function Packing({ tripId: propTripId, tripTitle: propTripTitle, destination: propDestination }) {
  // Standalone trips state if no propTripId
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(propTripId || "");

  const effectiveTripId = propTripId || selectedTripId;

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterMode, setFilterMode] = useState("ALL"); // ALL, UNPACKED, PACKED
  const [searchQuery, setSearchQuery] = useState("");
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(PACKING_TEMPLATES[0]);
  const [importingTemplate, setImportingTemplate] = useState(false);

  // If standalone, load all trips
  useEffect(() => {
    if (!propTripId) {
      const loadTrips = async () => {
        try {
          const data = await apiRequest("/trips");
          const list = data.trips || [];
          setTrips(list);
          if (list.length && !selectedTripId) {
            setSelectedTripId(list[0].id);
          }
        } catch (err) {
          setError(err.message);
        }
      };
      loadTrips();
    }
  }, [propTripId]);

  // Load packing items for effective trip
  useEffect(() => {
    if (!effectiveTripId) {
      setItems([]);
      return;
    }

    const loadItems = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/packing/${effectiveTripId}`);
        setItems(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [effectiveTripId]);

  const activeTrip = useMemo(() => {
    if (propTripId) {
      return { id: propTripId, title: propTripTitle, destination: propDestination };
    }
    return trips.find((t) => t.id === selectedTripId) || null;
  }, [propTripId, propTripTitle, propDestination, trips, selectedTripId]);

  const addItem = async (event) => {
    event.preventDefault();
    if (!name.trim() || !effectiveTripId) return;

    try {
      const data = await apiRequest(`/packing/${effectiveTripId}`, {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), category }),
      });

      setItems((current) => [...current, data.item]);
      setName("");
      setCategory("OTHER");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePacked = async (item) => {
    try {
      const data = await apiRequest(`/packing/${effectiveTripId}/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPacked: !item.isPacked }),
      });

      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? data.item : entry))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await apiRequest(`/packing/${effectiveTripId}/${itemId}`, {
        method: "DELETE",
      });

      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBatchToggle = async (markPacked) => {
    try {
      setError("");
      const data = await apiRequest(`/packing/${effectiveTripId}/batch`, {
        method: "PATCH",
        body: JSON.stringify({ isPacked: markPacked }),
      });
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all packing items for this trip?")) {
      return;
    }
    try {
      setError("");
      await apiRequest(`/packing/${effectiveTripId}/batch`, {
        method: "PATCH",
        body: JSON.stringify({ clearAll: true }),
      });
      setItems([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !effectiveTripId) return;
    try {
      setImportingTemplate(true);
      setError("");
      const data = await apiRequest(`/packing/${effectiveTripId}/batch`, {
        method: "POST",
        body: JSON.stringify({ items: selectedTemplate.items }),
      });
      setItems(data.items || []);
      setShowTemplatesModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setImportingTemplate(false);
    }
  };

  const packedCount = items.filter((item) => item.isPacked).length;
  const progress = items.length
    ? Math.round((packedCount / items.length) * 100)
    : 0;

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterMode === "PACKED" && !item.isPacked) return false;
      if (filterMode === "UNPACKED" && item.isPacked) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, filterMode, searchQuery]);

  // Analytics per category
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catItems = items.filter((it) => it.category === cat);
      const catPacked = catItems.filter((it) => it.isPacked).length;
      return {
        category: cat,
        label: categoryLabels[cat] || cat,
        total: catItems.length,
        packed: catPacked,
        pct: catItems.length ? Math.round((catPacked / catItems.length) * 100) : 0,
      };
    });
  }, [items]);

  const content = (
    <div className="packing-workspace">
      {/* Title & Actions */}
      <div className="feature-title-row">
        <div>
          <span className="feature-eyebrow">GET READY TO GO</span>
          <h2>Packing Checklist</h2>
          <p>{activeTrip ? `${activeTrip.title} · ${activeTrip.destination}` : "Select a trip"}</p>
        </div>
        <div className="packing-top-actions">
          <button
            type="button"
            className="feature-secondary-btn"
            onClick={() => setShowTemplatesModal(true)}
            disabled={!effectiveTripId}
          >
            <Sparkles size={16} /> Packing Templates
          </button>
        </div>
      </div>

      {/* Standalone Trip Selector */}
      {!propTripId && trips.length > 0 && (
        <div className="feature-toolbar">
          <label htmlFor="standalone-packing-trip">Choose a trip</label>
          <select
            id="standalone-packing-trip"
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} — {t.destination}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="feature-error">{error}</p>}

      {/* Progress & Analytics Card */}
      <div className="packing-analytics-card">
        <div className="packing-progress-header">
          <div className="packing-progress-title">
            <Luggage size={24} className="packing-progress-icon" />
            <div>
              <h3>
                {packedCount} of {items.length} items packed
              </h3>
              <p>
                {progress === 100 ? (
                  <span className="packing-all-done">
                    <PartyPopper size={14} /> Ready for departure! All items packed.
                  </span>
                ) : (
                  `${items.length - packedCount} items remaining to pack`
                )}
              </p>
            </div>
          </div>
          <div className="packing-progress-percentage">
            <span className="packing-pct-num">{progress}%</span>
            <span className="packing-pct-label">complete</span>
          </div>
        </div>

        <div className="packing-progress-bar-wrap">
          <div
            className={`packing-progress-fill ${
              progress === 100 ? "full" : progress >= 50 ? "half" : "low"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Category Breakdown Pills */}
        {items.length > 0 && (
          <div className="packing-cat-stats-row">
            {categoryStats
              .filter((stat) => stat.total > 0)
              .map((stat) => (
                <div key={stat.category} className="packing-stat-pill">
                  <span className="stat-pill-name">{stat.label}</span>
                  <span className="stat-pill-count">
                    {stat.packed}/{stat.total}
                  </span>
                  <div className="stat-pill-bar">
                    <div
                      className="stat-pill-fill"
                      style={{ width: `${stat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Batch Controls & Filter Toolbar */}
      {items.length > 0 && (
        <div className="packing-controls-bar">
          <div className="packing-search-box">
            <Search size={15} className="packing-search-icon" />
            <input
              type="text"
              placeholder="Filter items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="packing-search-clear"
                onClick={() => setSearchQuery("")}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="packing-filter-pills">
            <button
              type="button"
              className={`packing-pill-btn ${filterMode === "ALL" ? "active" : ""}`}
              onClick={() => setFilterMode("ALL")}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              className={`packing-pill-btn ${filterMode === "UNPACKED" ? "active" : ""}`}
              onClick={() => setFilterMode("UNPACKED")}
            >
              Remaining ({items.length - packedCount})
            </button>
            <button
              type="button"
              className={`packing-pill-btn ${filterMode === "PACKED" ? "active" : ""}`}
              onClick={() => setFilterMode("PACKED")}
            >
              Packed ({packedCount})
            </button>
          </div>

          <div className="packing-batch-actions">
            <button
              type="button"
              className="packing-batch-btn"
              onClick={() => handleBatchToggle(true)}
              title="Mark all as packed"
            >
              <CheckCheck size={14} /> Pack All
            </button>
            <button
              type="button"
              className="packing-batch-btn"
              onClick={() => handleBatchToggle(false)}
              title="Reset all to unpacked"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              type="button"
              className="packing-batch-btn danger"
              onClick={handleClearAll}
              title="Clear all packing items"
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Item Form */}
      <form className="packing-add-form" onSubmit={addItem}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Add custom item, e.g. Passport, Power adapter..."
          required
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((value) => (
            <option key={value} value={value}>
              {categoryLabels[value] || value}
            </option>
          ))}
        </select>

        <button className="feature-primary" disabled={!effectiveTripId}>
          <Plus size={17} /> Add Item
        </button>
      </form>

      {/* Item Groups by Category */}
      {categories.map((group) => {
        const groupItems = filteredItems.filter((item) => item.category === group);
        if (!groupItems.length) return null;

        const groupPackedCount = groupItems.filter((i) => i.isPacked).length;

        return (
          <section className="packing-group" key={group}>
            <div className="packing-group-header">
              <h3>
                {categoryLabels[group] || group}
                <span className="packing-group-count">
                  {groupPackedCount}/{groupItems.length}
                </span>
              </h3>
            </div>

            <div className="packing-items-grid">
              {groupItems.map((item) => (
                <div
                  className={`packing-item ${item.isPacked ? "item-packed" : ""}`}
                  key={item.id}
                >
                  <button
                    type="button"
                    className={`packing-check ${item.isPacked ? "checked" : ""}`}
                    onClick={() => togglePacked(item)}
                    aria-label="Toggle packed status"
                  >
                    {item.isPacked && <Check size={15} />}
                  </button>

                  <span className={`packing-name ${item.isPacked ? "packed-text" : ""}`}>
                    {item.name}
                  </span>

                  <button
                    type="button"
                    className="packing-delete"
                    onClick={() => deleteItem(item.id)}
                    aria-label="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {!items.length && (
        <div className="feature-empty">
          <Luggage size={40} />
          <h3>Your packing checklist is empty</h3>
          <p>Start from scratch above or choose a curated travel template.</p>
          <button
            type="button"
            className="feature-primary"
            onClick={() => setShowTemplatesModal(true)}
          >
            <Sparkles size={16} /> Choose a Packing Template
          </button>
        </div>
      )}

      {/* TEMPLATES MODAL */}
      {showTemplatesModal && (
        <div className="currency-modal-backdrop" onClick={() => setShowTemplatesModal(false)}>
          <div
            className="currency-modal-content packing-template-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="currency-modal-header">
              <div className="currency-header-title-box">
                <div className="currency-header-icon-wrap">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2>Curated Packing Templates</h2>
                  <p>Choose a trip profile to instantly generate essentials</p>
                </div>
              </div>
              <button
                type="button"
                className="currency-modal-close"
                onClick={() => setShowTemplatesModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="packing-template-modal-body">
              <div className="packing-template-nav">
                {PACKING_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    className={`packing-template-tab ${
                      selectedTemplate.id === tpl.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedTemplate(tpl)}
                  >
                    <div>
                      <strong>{tpl.name}</strong>
                      <small>{tpl.items.length} items</small>
                    </div>
                    <span className="tpl-badge">{tpl.badge}</span>
                  </button>
                ))}
              </div>

              <div className="packing-template-preview">
                <div className="tpl-preview-header">
                  <div>
                    <h3>{selectedTemplate.name}</h3>
                    <p>{selectedTemplate.description}</p>
                  </div>
                  <span className="tpl-preview-count">
                    {selectedTemplate.items.length} items
                  </span>
                </div>

                <div className="tpl-items-preview-list">
                  {selectedTemplate.items.map((it, idx) => (
                    <div key={idx} className="tpl-preview-item">
                      <span className="tpl-item-dot" />
                      <span className="tpl-item-name">{it.name}</span>
                      <span className="tpl-item-category">
                        {categoryLabels[it.category] || it.category}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="tpl-preview-actions">
                  <button
                    type="button"
                    className="feature-secondary"
                    onClick={() => setShowTemplatesModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="feature-primary"
                    onClick={handleApplyTemplate}
                    disabled={importingTemplate}
                  >
                    <Sparkles size={16} />
                    {importingTemplate
                      ? "Importing..."
                      : `Import ${selectedTemplate.items.length} Items`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // If used as standalone page, render with feature-page wrapper and header
  if (!propTripId) {
    return (
      <main className="feature-page packing-standalone-page">
        <header className="feature-header">
          <Link to="/dashboard" className="feature-back">
            <ArrowLeft size={18} /> Dashboard
          </Link>
          <span className="feature-brand">TripNest</span>
        </header>
        <section className="feature-content">{content}</section>
      </main>
    );
  }

  // Embedded in Itinerary tab
  return content;
}

export default Packing;
