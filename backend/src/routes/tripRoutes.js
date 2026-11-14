
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createTrip,
  getMyTrips,
  getTripById,
  deleteTrip,
} = require("../controllers/tripController");

// All trip routes require authentication
router.post("/", authMiddleware, createTrip);
router.get("/", authMiddleware, getMyTrips);
// Get a single trip
router.get("/:id", authMiddleware, getTripById);
// Delete a trip
router.delete("/:tripId", authMiddleware, deleteTrip);

module.exports = router;
