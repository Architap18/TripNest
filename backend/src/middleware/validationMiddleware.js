// Reusable request payload validation and sanitization middleware

const sanitizeString = (val) => {
  if (typeof val !== "string") return "";
  return val.trim();
};

const validateTripInput = (req, res, next) => {
  const { title, destination, startDate, endDate, budget, currency } = req.body;

  if (req.method === "POST" && (!title || !destination || !startDate || !endDate)) {
    return res.status(400).json({
      message: "Title, destination, start date and end date are required",
    });
  }

  if (title !== undefined) {
    const cleanTitle = sanitizeString(title);
    if (!cleanTitle) {
      return res.status(400).json({ message: "Trip title cannot be empty" });
    }
    if (cleanTitle.length > 150) {
      return res.status(400).json({ message: "Trip title must be under 150 characters" });
    }
    req.body.title = cleanTitle;
  }

  if (destination !== undefined) {
    const cleanDest = sanitizeString(destination);
    if (!cleanDest) {
      return res.status(400).json({ message: "Destination cannot be empty" });
    }
    req.body.destination = cleanDest;
  }

  if (startDate !== undefined && endDate !== undefined) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Please provide valid ISO dates" });
    }

    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }
  }

  if (budget !== undefined && budget !== null && budget !== "") {
    const num = Number(budget);
    if (!Number.isFinite(num) || num < 0) {
      return res.status(400).json({ message: "Budget must be a non-negative number" });
    }
  }

  if (currency !== undefined) {
    const cleanCurr = sanitizeString(currency).toUpperCase();
    if (cleanCurr.length > 5) {
      return res.status(400).json({ message: "Invalid currency code" });
    }
    req.body.currency = cleanCurr || "INR";
  }

  next();
};

const validateExpenseInput = (req, res, next) => {
  const { title, amount, category, spentAt } = req.body;

  if (req.method === "POST" && (!title || amount === undefined || amount === "")) {
    return res.status(400).json({ message: "Title and amount are required" });
  }

  if (title !== undefined) {
    const cleanTitle = sanitizeString(title);
    if (!cleanTitle) {
      return res.status(400).json({ message: "Expense title cannot be empty" });
    }
    req.body.title = cleanTitle;
  }

  if (amount !== undefined) {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }
    req.body.amount = num;
  }

  if (category !== undefined) {
    const allowed = [
      "TRANSPORT",
      "ACCOMMODATION",
      "FOOD",
      "ACTIVITIES",
      "SHOPPING",
      "OTHER",
    ];
    if (!allowed.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Allowed: ${allowed.join(", ")}` });
    }
  }

  if (spentAt !== undefined) {
    const date = new Date(spentAt);
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid spentAt date" });
    }
  }

  next();
};

const validateItineraryInput = (req, res, next) => {
  const { title, dateTime, duration, category } = req.body;

  if (req.method === "POST" && (!title || !dateTime)) {
    return res.status(400).json({ message: "Title and date/time are required" });
  }

  if (title !== undefined) {
    const cleanTitle = sanitizeString(title);
    if (!cleanTitle) {
      return res.status(400).json({ message: "Activity title cannot be empty" });
    }
    req.body.title = cleanTitle;
  }

  if (dateTime !== undefined) {
    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ message: "Please provide a valid date and time" });
    }
  }

  if (duration !== undefined && duration !== null && duration !== "") {
    const num = Number(duration);
    if (!Number.isFinite(num) || num <= 0) {
      return res.status(400).json({ message: "Duration must be a positive number in minutes" });
    }
  }

  if (category !== undefined) {
    const allowed = [
      "SIGHTSEEING",
      "FOOD",
      "TRANSPORT",
      "ACTIVITY",
      "SHOPPING",
      "OTHER",
    ];
    if (!allowed.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }
  }

  next();
};

module.exports = {
  validateTripInput,
  validateExpenseInput,
  validateItineraryInput,
};
