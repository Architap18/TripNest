import { useState, useMemo } from "react";
import { ArrowRightLeft, Coins, X, RefreshCw, Calculator, BookmarkCheck } from "lucide-react";

// Standard travel benchmark exchange rates relative to 1 USD
const USD_RATES = {
  USD: 1.0,
  INR: 83.45,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  THB: 36.8,
  SGD: 1.35,
  JPY: 155.2,
  CAD: 1.37,
  AUD: 1.52,
};

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED",
  THB: "฿",
  SGD: "S$",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
};

const CURRENCY_NAMES = {
  INR: "Indian Rupee",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  AED: "UAE Dirham",
  THB: "Thai Baht",
  SGD: "Singapore Dollar",
  JPY: "Japanese Yen",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
};

export default function CurrencyConverter({
  tripCurrency = "INR",
  tripTotalSpent = 0,
  tripRemaining = null,
  isOpen,
  onClose,
}) {
  const [fromCurrency, setFromCurrency] = useState(tripCurrency || "INR");
  const [toCurrency, setToCurrency] = useState(tripCurrency === "USD" ? "EUR" : "USD");
  const [amount, setAmount] = useState("1000");

  const convertRate = (from, to) => {
    const fromRate = USD_RATES[from] || 1;
    const toRate = USD_RATES[to] || 1;
    return toRate / fromRate;
  };

  const exchangeRate = useMemo(() => {
    return convertRate(fromCurrency, toCurrency);
  }, [fromCurrency, toCurrency]);

  const convertedValue = useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num)) return 0;
    return num * exchangeRate;
  }, [amount, exchangeRate]);

  const tripTotalConverted = useMemo(() => {
    if (!tripTotalSpent) return 0;
    const rate = convertRate(tripCurrency, toCurrency);
    return tripTotalSpent * rate;
  }, [tripTotalSpent, tripCurrency, toCurrency]);

  const tripRemainingConverted = useMemo(() => {
    if (tripRemaining === null) return null;
    const rate = convertRate(tripCurrency, toCurrency);
    return tripRemaining * rate;
  }, [tripRemaining, tripCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  if (!isOpen) return null;

  const cheatSheetValues = [100, 500, 1000, 2500, 5000];

  return (
    <div className="currency-modal-backdrop" onClick={onClose}>
      <div
        className="currency-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="currency-converter-title"
      >
        <div className="currency-modal-header">
          <div className="currency-header-title-box">
            <div className="currency-header-icon-wrap">
              <Coins size={20} />
            </div>
            <div>
              <h2 id="currency-converter-title">Travel Currency Converter</h2>
              <p>Real-time exchange estimates for international trips</p>
            </div>
          </div>
          <button
            type="button"
            className="currency-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="currency-modal-body">
          {/* Conversion Form */}
          <div className="currency-form-grid">
            <div className="currency-input-group">
              <label htmlFor="currency-amount">Amount</label>
              <div className="currency-input-box">
                <span className="currency-symbol-tag">
                  {CURRENCY_SYMBOLS[fromCurrency] || fromCurrency}
                </span>
                <input
                  id="currency-amount"
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="currency-pair-row">
              <div className="currency-select-box">
                <label htmlFor="from-currency-select">From</label>
                <select
                  id="from-currency-select"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                >
                  {Object.keys(USD_RATES).map((curr) => (
                    <option key={curr} value={curr}>
                      {curr} — {CURRENCY_NAMES[curr]}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="currency-swap-button"
                onClick={handleSwap}
                title="Swap currencies"
                aria-label="Swap currencies"
              >
                <ArrowRightLeft size={16} />
              </button>

              <div className="currency-select-box">
                <label htmlFor="to-currency-select">To</label>
                <select
                  id="to-currency-select"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                >
                  {Object.keys(USD_RATES).map((curr) => (
                    <option key={curr} value={curr}>
                      {curr} — {CURRENCY_NAMES[curr]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Primary Result Display */}
          <div className="currency-result-card">
            <span className="currency-result-label">Converted Amount</span>
            <div className="currency-result-val">
              {CURRENCY_SYMBOLS[toCurrency]}{" "}
              {convertedValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <span className="currency-result-code">{toCurrency}</span>
            </div>
            <div className="currency-rate-subtext">
              1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </div>
          </div>

          {/* Current Trip Summary Conversion */}
          {tripTotalSpent > 0 && (
            <div className="currency-trip-summary-box">
              <div className="currency-trip-summary-title">
                <Calculator size={14} />
                <span>Current Trip in {toCurrency}</span>
              </div>
              <div className="currency-trip-summary-values">
                <div>
                  <small>Total Spent ({tripCurrency}):</small>
                  <strong>
                    {CURRENCY_SYMBOLS[tripCurrency]}
                    {tripTotalSpent.toLocaleString()}
                  </strong>
                  <span className="converted-eq">
                    ≈ {CURRENCY_SYMBOLS[toCurrency]}
                    {tripTotalConverted.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {tripRemaining !== null && (
                  <div>
                    <small>Remaining Budget ({tripCurrency}):</small>
                    <strong style={{ color: tripRemaining >= 0 ? "#10b981" : "#ef4444" }}>
                      {CURRENCY_SYMBOLS[tripCurrency]}
                      {tripRemaining.toLocaleString()}
                    </strong>
                    <span className="converted-eq">
                      ≈ {CURRENCY_SYMBOLS[toCurrency]}
                      {tripRemainingConverted.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Cheat Sheet */}
          <div className="currency-cheat-sheet">
            <span className="currency-cheat-title">
              <BookmarkCheck size={14} /> Quick Reference Cheat-Sheet
            </span>
            <div className="currency-cheat-grid">
              {cheatSheetValues.map((val) => (
                <div key={val} className="currency-cheat-pill">
                  <span>
                    {CURRENCY_SYMBOLS[fromCurrency]}
                    {val}
                  </span>
                  <span>=</span>
                  <strong>
                    {CURRENCY_SYMBOLS[toCurrency]}
                    {(val * exchangeRate).toFixed(val * exchangeRate > 100 ? 0 : 2)}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="currency-disclaimer">
            <RefreshCw size={12} />
            <span>
              Benchmark Travel Exchange Rates • Updated November 2026 • Live conversions are indicative estimates for trip budgeting.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
