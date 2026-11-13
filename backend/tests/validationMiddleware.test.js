const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  validateTripInput,
  validateExpenseInput,
  validateItineraryInput,
} = require("../src/middleware/validationMiddleware");

// Helper to mock Express req, res, next
const createMockContext = (body = {}, method = "POST") => {
  const req = { body, method };
  let statusCode = 200;
  let jsonResponse = null;
  let nextCalled = false;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
  };

  const next = () => {
    nextCalled = true;
  };

  return {
    req,
    res,
    next,
    getStatusCode: () => statusCode,
    getJsonResponse: () => jsonResponse,
    isNextCalled: () => nextCalled,
  };
};

describe("Validation Middleware Unit Suite", () => {
  describe("validateTripInput", () => {
    it("should reject POST when required fields are missing", () => {
      const ctx = createMockContext({ title: "Goa Trip" }, "POST");
      validateTripInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.getStatusCode(), 400);
      assert.equal(ctx.isNextCalled(), false);
      assert.match(ctx.getJsonResponse().message, /required/i);
    });

    it("should reject invalid date order (end date before start date)", () => {
      const ctx = createMockContext(
        {
          title: "Himalayas Trek",
          destination: "Manali",
          startDate: "2026-06-15",
          endDate: "2026-06-10",
        },
        "POST"
      );
      validateTripInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.getStatusCode(), 400);
      assert.equal(ctx.isNextCalled(), false);
      assert.match(ctx.getJsonResponse().message, /cannot be before start date/i);
    });

    it("should reject invalid budget values", () => {
      const ctx = createMockContext(
        {
          title: "Kyoto Autumn",
          destination: "Kyoto",
          startDate: "2026-10-01",
          endDate: "2026-10-10",
          budget: -500,
        },
        "POST"
      );
      validateTripInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.getStatusCode(), 400);
      assert.match(ctx.getJsonResponse().message, /non-negative/i);
    });

    it("should trim strings and format currency code", () => {
      const ctx = createMockContext(
        {
          title: "  Paris Vacation  ",
          destination: "  Paris, France  ",
          startDate: "2026-08-01",
          endDate: "2026-08-08",
          budget: 150000,
          currency: "eur",
        },
        "POST"
      );
      validateTripInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.isNextCalled(), true);
      assert.equal(ctx.req.body.title, "Paris Vacation");
      assert.equal(ctx.req.body.destination, "Paris, France");
      assert.equal(ctx.req.body.currency, "EUR");
    });
  });

  describe("validateExpenseInput", () => {
    it("should reject POST when title or amount is missing", () => {
      const ctx = createMockContext({ category: "FOOD" }, "POST");
      validateExpenseInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.getStatusCode(), 400);
      assert.equal(ctx.isNextCalled(), false);
    });

    it("should reject negative or zero amount", () => {
      const ctx = createMockContext({ title: "Coffee", amount: -20 }, "POST");
      validateExpenseInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.getStatusCode(), 400);
      assert.match(ctx.getJsonResponse().message, /positive number/i);
    });

    it("should reject invalid category", () => {
      const ctx = createMockContext(
        { title: "Museum Ticket", amount: 25, category: "INVALID_CAT" },
        "POST"
      );
      validateExpenseInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.getStatusCode(), 400);
      assert.match(ctx.getJsonResponse().message, /Invalid category/i);
    });

    it("should accept valid expense payload and parse amount to float", () => {
      const ctx = createMockContext(
        {
          title: "  Dinner at Trattoria  ",
          amount: "48.50",
          category: "FOOD",
        },
        "POST"
      );
      validateExpenseInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.isNextCalled(), true);
      assert.equal(ctx.req.body.title, "Dinner at Trattoria");
      assert.equal(ctx.req.body.amount, 48.5);
    });
  });

  describe("validateItineraryInput", () => {
    it("should reject POST missing title or dateTime", () => {
      const ctx = createMockContext({ duration: 60 }, "POST");
      validateItineraryInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.getStatusCode(), 400);
      assert.equal(ctx.isNextCalled(), false);
    });

    it("should reject malformed date strings", () => {
      const ctx = createMockContext(
        { title: "Scuba Diving", dateTime: "not-a-valid-date" },
        "POST"
      );
      validateItineraryInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.getStatusCode(), 400);
      assert.match(ctx.getJsonResponse().message, /valid date and time/i);
    });

    it("should pass valid itinerary item", () => {
      const ctx = createMockContext(
        {
          title: "Taj Mahal Sunrise Tour",
          dateTime: "2026-04-12T05:30:00.000Z",
          duration: 120,
          category: "SIGHTSEEING",
        },
        "POST"
      );
      validateItineraryInput(ctx.req, ctx.res, ctx.next);

      assert.equal(ctx.isNextCalled(), true);
      assert.equal(ctx.req.body.title, "Taj Mahal Sunrise Tour");
    });
  });
});
