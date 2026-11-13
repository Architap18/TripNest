
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Pencil, Trash2, Wallet,
  TrendingUp, Receipt, X, AlertTriangle, CheckCircle2,
  Calendar, Flame, Search, Filter, ArrowUpDown, RotateCcw
} from "lucide-react";
import { apiRequest } from "../services/api";
import "./FeaturePage.css";

const categories = [
  "TRANSPORT",
  "ACCOMMODATION",
  "FOOD",
  "ACTIVITIES",
  "SHOPPING",
  "OTHER",
];

const categoryColors = {
  TRANSPORT: "#3b82f6",
  ACCOMMODATION: "#8b5cf6",
  FOOD: "#f97316",
  ACTIVITIES: "#10b981",
  SHOPPING: "#ec4899",
  OTHER: "#6b7280",
};

const emptyForm = {
  title: "",
  amount: "",
  category: "OTHER",
  description: "",
  spentAt: new Date().toISOString().slice(0, 10),
};

const formatMoney = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

function Expenses() {
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    budget: null,
    totalSpent: 0,
    remaining: null,
    categoryTotals: {},
    currency: "INR",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [filterCategory, setFilterCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    if (tripId) loadExpenses();
    else setExpenses([]);
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

  const loadExpenses = async () => {
    try {
      setError("");
      const data = await apiRequest(`/expenses/${tripId}`);
      setExpenses(data.expenses || []);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    }
  };

  const selectedTrip = trips.find((trip) => trip.id === tripId);

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      spentAt: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const openEditForm = (expense) => {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      description: expense.description || "",
      spentAt: new Date(expense.spentAt).toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const body = {
        ...form,
        amount: Number(form.amount),
        spentAt: new Date(`${form.spentAt}T12:00:00`).toISOString(),
      };

      const endpoint = editingId
        ? `/expenses/${tripId}/${editingId}`
        : `/expenses/${tripId}`;

      await apiRequest(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      setError("");

      await apiRequest(`/expenses/${tripId}/${expenseId}`, {
        method: "DELETE",
      });

      setExpenses((current) =>
        current.filter((expense) => expense.id !== expenseId)
      );

      await loadExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="feature-loading">Loading your trips...</div>;
  }

  const rawPercentage =
    summary.budget && summary.budget > 0
      ? (summary.totalSpent / summary.budget) * 100
      : 0;
  const clampedPercentage = Math.min(rawPercentage, 100);
  const isOverBudget = summary.budget !== null && summary.totalSpent > summary.budget;
  const isNearBudget = summary.budget !== null && !isOverBudget && rawPercentage >= 80;
  const budgetStatus = isOverBudget ? "danger" : isNearBudget ? "warning" : "safe";

  const highestExpense = expenses.length
    ? expenses.reduce(
        (max, e) => (Number(e.amount) > Number(max.amount) ? e : max),
        expenses[0]
      )
    : null;

  const tripDays =
    selectedTrip?.startDate && selectedTrip?.endDate
      ? Math.max(
          1,
          Math.round(
            (new Date(selectedTrip.endDate) - new Date(selectedTrip.startDate)) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      : null;

  const dailyAverage =
    tripDays && summary.totalSpent > 0 ? summary.totalSpent / tripDays : null;

  const filteredExpenses = expenses
    .filter((item) => {
      if (filterCategory !== "ALL" && item.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      if (dateFrom && new Date(item.spentAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(item.spentAt) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.spentAt) - new Date(a.spentAt);
      if (sortBy === "date-asc") return new Date(a.spentAt) - new Date(b.spentAt);
      if (sortBy === "amount-desc") return Number(b.amount) - Number(a.amount);
      if (sortBy === "amount-asc") return Number(a.amount) - Number(b.amount);
      if (sortBy === "title-asc") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

  const filteredTotal = filteredExpenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const hasActiveFilters =
    filterCategory !== "ALL" ||
    searchQuery.trim() !== "" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    sortBy !== "date-desc";

  const resetFilters = () => {
    setFilterCategory("ALL");
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setSortBy("date-desc");
  };

  return (
    <main className="feature-page expenses-page">
      <header className="feature-header">
        <Link to="/dashboard" className="feature-back">
          <ArrowLeft size={18} /> Dashboard
        </Link>
        <span className="feature-brand">TripNest</span>
      </header>

      <section className="feature-content">
        <div className="feature-title-row">
          <div>
            <span className="feature-eyebrow">TRAVEL SMARTER</span>
            <h1>Track Expenses</h1>
            <p>Keep your trip budget organized and under control.</p>
          </div>
          <button
            className="feature-primary"
            onClick={openAddForm}
            disabled={!tripId}
          >
            <Plus size={17} /> Add Expense
          </button>
        </div>

        <div className="feature-toolbar">
          <label htmlFor="expense-trip">Choose a trip</label>
          <select
            id="expense-trip"
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

        {!trips.length ? (
          <div className="feature-empty">
            <Wallet size={36} />
            <h2>Create a trip first</h2>
            <p>Expenses are recorded against a trip.</p>
            <Link to="/dashboard">Go to dashboard</Link>
          </div>
        ) : (
          <>
            <div className="feature-trip-banner">
              <div>
                <span>EXPENSES FOR</span>
                <h2>{selectedTrip?.title}</h2>
                <p>{selectedTrip?.destination}</p>
              </div>
              <Wallet size={35} />
            </div>

            <div className="expense-summary-grid">
              <article className="expense-summary-card">
                <span><Wallet size={17} /> Total budget</span>
                <strong>
                  {summary.budget === null
                    ? "Not set"
                    : formatMoney(summary.budget, summary.currency)}
                </strong>
              </article>

              <article className="expense-summary-card">
                <span><Receipt size={17} /> Total spent</span>
                <strong>
                  {formatMoney(summary.totalSpent, summary.currency)}
                </strong>
              </article>

              <article className="expense-summary-card">
                <span><TrendingUp size={17} /> Remaining</span>
                <strong>
                  {summary.remaining === null
                    ? "Not set"
                    : formatMoney(summary.remaining, summary.currency)}
                </strong>
              </article>
            </div>

            {summary.budget !== null && (
              <section className={`expense-budget-panel budget-status-${budgetStatus}`}>
                <div className="expense-budget-header">
                  <div>
                    <div className="budget-title-badge-row">
                      <h2>Budget Utilization</h2>
                      <span className={`budget-status-pill ${budgetStatus}`}>
                        {budgetStatus === "danger" && <AlertTriangle size={13} />}
                        {budgetStatus === "warning" && <AlertTriangle size={13} />}
                        {budgetStatus === "safe" && <CheckCircle2 size={13} />}
                        {budgetStatus === "danger"
                          ? "Over Budget"
                          : budgetStatus === "warning"
                          ? "Approaching Limit"
                          : "On Track"}
                      </span>
                    </div>
                    <p className="budget-subtitle">
                      {budgetStatus === "danger"
                        ? `You have exceeded your planned budget by ${formatMoney(summary.totalSpent - summary.budget, summary.currency)}!`
                        : budgetStatus === "warning"
                        ? `Caution: You have used ${rawPercentage.toFixed(1)}% of your budget. Only ${formatMoney(summary.remaining, summary.currency)} remaining.`
                        : `Healthy spending: ${formatMoney(summary.remaining, summary.currency)} (${(100 - rawPercentage).toFixed(1)}%) remaining.`}
                    </p>
                  </div>
                  <div className="budget-percentage-display">
                    <span className="budget-percentage-num">{rawPercentage.toFixed(1)}%</span>
                    <span className="budget-percentage-sub">utilized</span>
                  </div>
                </div>

                <div className="expense-progress-bar-container">
                  <div className="expense-progress-track">
                    <div
                      className={`expense-progress-fill fill-${budgetStatus}`}
                      style={{ width: `${clampedPercentage}%` }}
                    />
                  </div>
                  <div className="expense-progress-markers">
                    <span>0%</span>
                    <span>50%</span>
                    <span>80%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="budget-intelligence-grid">
                  <div className="budget-intel-item">
                    <span className="intel-label">
                      <Flame size={13} /> Average Daily Spend
                    </span>
                    <strong>
                      {dailyAverage !== null
                        ? `${formatMoney(dailyAverage, summary.currency)} / day`
                        : "N/A (Dates missing)"}
                    </strong>
                    <small>
                      {tripDays ? `Across ${tripDays} days trip` : "Add trip dates to view"}
                    </small>
                  </div>

                  <div className="budget-intel-item">
                    <span className="intel-label">
                      <TrendingUp size={13} /> Peak Expense
                    </span>
                    <strong>
                      {highestExpense
                        ? formatMoney(highestExpense.amount, summary.currency)
                        : "None"}
                    </strong>
                    <small>
                      {highestExpense ? highestExpense.title : "No records"}
                    </small>
                  </div>

                  <div className="budget-intel-item">
                    <span className="intel-label">
                      <Wallet size={13} /> Remaining Safe Pace
                    </span>
                    <strong>
                      {tripDays && summary.remaining > 0
                        ? `${formatMoney(summary.remaining / tripDays, summary.currency)} / day`
                        : summary.remaining <= 0
                        ? "Exhausted"
                        : "N/A"}
                    </strong>
                    <small>To stay within budget</small>
                  </div>
                </div>
              </section>
            )}

            <section className="expense-list-panel">
              <div className="expense-list-heading">
                <div>
                  <h2>All Expenses</h2>
                  <p>Filter, search, and manage your trip transactions.</p>
                </div>
                <div className="expense-heading-badges">
                  {hasActiveFilters && (
                    <span className="expense-subtotal-badge">
                      Filtered: {formatMoney(filteredTotal, summary.currency)}
                    </span>
                  )}
                  <span className="expense-count-badge">
                    {filteredExpenses.length} of {expenses.length} records
                  </span>
                </div>
              </div>

              {expenses.length > 0 && (
                <div className="expense-filter-controls">
                  <div className="expense-filter-row-top">
                    <div className="expense-search-wrapper">
                      <Search size={16} className="expense-search-icon" />
                      <input
                        type="text"
                        placeholder="Search by title or notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="expense-search-input"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          className="expense-search-clear"
                          onClick={() => setSearchQuery("")}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="expense-sort-wrapper">
                      <ArrowUpDown size={15} />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="expense-sort-select"
                        aria-label="Sort expenses"
                      >
                        <option value="date-desc">Date: Newest First</option>
                        <option value="date-asc">Date: Oldest First</option>
                        <option value="amount-desc">Amount: High to Low</option>
                        <option value="amount-asc">Amount: Low to High</option>
                        <option value="title-asc">Title: A to Z</option>
                      </select>
                    </div>

                    <div className="expense-date-filter-group">
                      <label className="expense-date-label">
                        From:
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="expense-date-input"
                        />
                      </label>
                      <label className="expense-date-label">
                        To:
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="expense-date-input"
                        />
                      </label>
                    </div>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        className="expense-reset-btn"
                        onClick={resetFilters}
                        title="Reset all filters"
                      >
                        <RotateCcw size={14} /> Reset
                      </button>
                    )}
                  </div>

                  <div className="expense-category-filter-chips">
                    <span className="expense-chip-label">Category:</span>
                    <button
                      type="button"
                      className={`expense-cat-chip ${filterCategory === "ALL" ? "active" : ""}`}
                      onClick={() => setFilterCategory("ALL")}
                    >
                      All ({expenses.length})
                    </button>
                    {categories.map((cat) => {
                      const count = expenses.filter((e) => e.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          className={`expense-cat-chip ${filterCategory === cat ? "active" : ""}`}
                          onClick={() => setFilterCategory(cat)}
                        >
                          <span
                            className="expense-chip-dot"
                            style={{ backgroundColor: categoryColors[cat] || "#6b7280" }}
                          />
                          {cat} {count > 0 && `(${count})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {expenses.length === 0 ? (
                <div className="feature-empty">
                  <Receipt size={34} />
                  <h3>No expenses recorded</h3>
                  <p>Add your first expense to start tracking your budget.</p>
                  <button className="feature-primary" onClick={openAddForm}>
                    <Plus size={16} /> Add Expense
                  </button>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="feature-empty">
                  <Filter size={32} />
                  <h3>No expenses match your filters</h3>
                  <p>Try adjusting your search query, category, or date range.</p>
                  <button className="feature-primary" onClick={resetFilters}>
                    <RotateCcw size={15} /> Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="expense-table-wrap">
                  <table className="expense-table">
                    <thead>
                      <tr>
                        <th>Expense</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>
                            <strong>{expense.title}</strong>
                            {expense.description && (
                              <small>{expense.description}</small>
                            )}
                          </td>
                          <td>
                            <span className="expense-category">
                              {expense.category}
                            </span>
                          </td>
                          <td>
                            {new Date(expense.spentAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>
                          <td className="expense-amount">
                            {formatMoney(expense.amount, summary.currency)}
                          </td>
                          <td>
                            <div className="expense-row-actions">
                              <button
                                onClick={() => openEditForm(expense)}
                                aria-label="Edit expense"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => deleteExpense(expense.id)}
                                aria-label="Delete expense"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="expense-category-panel">
              <div className="expense-category-panel-header">
                <div>
                  <h2>Spending by category</h2>
                  <p>Visual breakdown of how your travel budget is distributed.</p>
                </div>
                {summary.totalSpent > 0 && (
                  <span className="expense-total-badge">
                    Total: {formatMoney(summary.totalSpent, summary.currency)}
                  </span>
                )}
              </div>

              {Object.keys(summary.categoryTotals || {}).length === 0 ? (
                <p className="expense-no-data">No category data recorded yet.</p>
              ) : (
                <>
                  <div className="expense-category-stacked-bar">
                    {Object.entries(summary.categoryTotals).map(([cat, amount]) => {
                      const pct = summary.totalSpent > 0 ? (amount / summary.totalSpent) * 100 : 0;
                      if (pct <= 0) return null;
                      return (
                        <div
                          key={cat}
                          className="expense-stacked-segment"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: categoryColors[cat] || "#6b7280",
                          }}
                          title={`${cat}: ${formatMoney(amount, summary.currency)} (${pct.toFixed(1)}%)`}
                        />
                      );
                    })}
                  </div>

                  <div className="expense-category-cards-grid">
                    {Object.entries(summary.categoryTotals).map(([category, amount]) => {
                      const pct =
                        summary.totalSpent > 0
                          ? ((amount / summary.totalSpent) * 100).toFixed(1)
                          : "0.0";
                      const color = categoryColors[category] || "#6b7280";

                      return (
                        <div className="expense-category-card" key={category}>
                          <div className="expense-cat-header">
                            <span
                              className="expense-cat-badge"
                              style={{ borderColor: color, color }}
                            >
                              <span
                                className="expense-cat-dot"
                                style={{ backgroundColor: color }}
                              />
                              {category}
                            </span>
                            <span className="expense-cat-pct">{pct}%</span>
                          </div>

                          <strong className="expense-cat-amount">
                            {formatMoney(amount, summary.currency)}
                          </strong>

                          <div className="expense-cat-mini-bar">
                            <div
                              className="expense-cat-mini-fill"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </section>

      {showForm && (
        <div className="feature-modal-backdrop">
          <form className="feature-modal" onSubmit={handleSubmit}>
            <div className="feature-modal-heading">
              <div>
                <span className="feature-eyebrow">TRIP BUDGET</span>
                <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>
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

            <label>Expense title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Hotel booking"
              required
            />

            <label>Amount ({summary.currency}) *</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="e.g. 2500"
              min="0.01"
              step="0.01"
              required
            />

            <label>Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="2"
              placeholder="Optional details"
            />

            <label>Date spent *</label>
            <input
              type="date"
              name="spentAt"
              value={form.spentAt}
              onChange={handleChange}
              required
            />

            {error && <p className="feature-error">{error}</p>}

            <div className="feature-modal-actions">
              <button
                type="button"
                className="feature-secondary"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button className="feature-primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default Expenses;
