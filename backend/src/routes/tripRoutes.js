
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");
const { validateTripInput } = require("../middleware/validationMiddleware");

const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // continue as unauthenticated guest
  }
  next();
};

const {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  duplicateTrip,
  getTripSummary,
} = require("../controllers/tripController");

// Public/shared read-only summary
router.get("/:id/summary", optionalAuth, getTripSummary);

// Authenticated trip routes
router.post("/", authMiddleware, validateTripInput, createTrip);
router.get("/", authMiddleware, getMyTrips);
// Get a single trip
router.get("/:id", authMiddleware, getTripById);
router.put("/:id", authMiddleware, validateTripInput, updateTrip);
router.delete("/:id", authMiddleware, deleteTrip);
router.post("/:id/duplicate", authMiddleware, duplicateTrip);

module.exports = router;
