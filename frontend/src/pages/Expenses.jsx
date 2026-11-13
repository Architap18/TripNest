
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Pencil, Trash2, Wallet,
  TrendingUp, Receipt, X,
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

  const spentPercentage =
    summary.budget && summary.budget > 0
      ? Math.min((summary.totalSpent / summary.budget) * 100, 100)
      : 0;

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
              <section className="expense-budget-panel">
                <div>
                  <h2>Budget usage</h2>
                  <span>{spentPercentage.toFixed(1)}% used</span>
                </div>
                <div className="expense-progress">
                  <span style={{ width: `${spentPercentage}%` }} />
                </div>
              </section>
            )}

            <section className="expense-list-panel">
              <div className="expense-list-heading">
                <div>
                  <h2>All expenses</h2>
                  <p>Your recorded trip costs.</p>
                </div>
                <span>{expenses.length} records</span>
              </div>

              {expenses.length === 0 ? (
                <div className="feature-empty">
                  <Receipt size={34} />
                  <h3>No expenses recorded</h3>
                  <p>Add your first expense to start tracking your budget.</p>
                  <button className="feature-primary" onClick={openAddForm}>
                    <Plus size={16} /> Add Expense
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
                      {expenses.map((expense) => (
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
