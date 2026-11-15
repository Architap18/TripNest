const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

// Pure domain logic tests for TripNest business calculations

const calculateTripStatus = (startDate, endDate, referenceDate = new Date()) => {
  const ref = new Date(referenceDate);
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (ref < start) return "UPCOMING";
  if (ref > end) return "COMPLETED";
  return "ONGOING";
};

const calculateBudgetUtilization = (budget, expenses = []) => {
  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const budgetNum = Number(budget) || 0;
  const remaining = budgetNum - totalSpent;
  const percentage = budgetNum > 0 ? (totalSpent / budgetNum) * 100 : 0;
  const isOverBudget = totalSpent > budgetNum && budgetNum > 0;

  return {
    totalSpent,
    budget: budgetNum,
    remaining,
    percentage: Math.round(percentage * 10) / 10,
    isOverBudget,
  };
};

const calculatePackingProgress = (items = []) => {
  if (!items.length) return { total: 0, packed: 0, percentage: 0 };
  const packed = items.filter((i) => i.isPacked).length;
  const percentage = Math.round((packed / items.length) * 100);
  return { total: items.length, packed, percentage };
};

describe("TripNest Core Business Logic Suite", () => {
  describe("calculateTripStatus", () => {
    const today = new Date("2026-06-15T10:00:00.000Z");

    it("should correctly classify an upcoming trip", () => {
      const status = calculateTripStatus("2026-07-01", "2026-07-10", today);
      assert.equal(status, "UPCOMING");
    });

    it("should correctly classify an ongoing trip", () => {
      const status = calculateTripStatus("2026-06-10", "2026-06-20", today);
      assert.equal(status, "ONGOING");
    });

    it("should correctly classify a completed trip", () => {
      const status = calculateTripStatus("2026-05-01", "2026-05-10", today);
      assert.equal(status, "COMPLETED");
    });
  });

  describe("calculateBudgetUtilization", () => {
    it("should calculate exact spending and remaining budget under threshold", () => {
      const expenses = [
        { amount: 1500, category: "FOOD" },
        { amount: 2500, category: "TRANSPORT" },
      ];
      const result = calculateBudgetUtilization(10000, expenses);

      assert.equal(result.totalSpent, 4000);
      assert.equal(result.remaining, 6000);
      assert.equal(result.percentage, 40);
      assert.equal(result.isOverBudget, false);
    });

    it("should detect over-budget scenarios", () => {
      const expenses = [
        { amount: 6000, category: "ACCOMMODATION" },
        { amount: 5000, category: "ACTIVITIES" },
      ];
      const result = calculateBudgetUtilization(10000, expenses);

      assert.equal(result.totalSpent, 11000);
      assert.equal(result.remaining, -1000);
      assert.equal(result.percentage, 110);
      assert.equal(result.isOverBudget, true);
    });

    it("should safely handle zero or missing budget", () => {
      const expenses = [{ amount: 200, category: "OTHER" }];
      const result = calculateBudgetUtilization(0, expenses);

      assert.equal(result.totalSpent, 200);
      assert.equal(result.percentage, 0);
      assert.equal(result.isOverBudget, false);
    });
  });

  describe("calculatePackingProgress", () => {
    it("should handle empty list gracefully", () => {
      const result = calculatePackingProgress([]);
      assert.equal(result.percentage, 0);
      assert.equal(result.total, 0);
    });

    it("should compute accurate packed ratio", () => {
      const items = [
        { name: "Passport", isPacked: true },
        { name: "Charger", isPacked: true },
        { name: "Camera", isPacked: false },
        { name: "Toothbrush", isPacked: false },
      ];
      const result = calculatePackingProgress(items);
      assert.equal(result.total, 4);
      assert.equal(result.packed, 2);
      assert.equal(result.percentage, 50);
    });
  });
});
