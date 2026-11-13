
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  duplicateTrip,
  getTripSummary,
} = require("../controllers/tripController");

// All trip routes require authentication
router.post("/", authMiddleware, createTrip);
router.get("/", authMiddleware, getMyTrips);
router.get("/:id/summary", authMiddleware, getTripSummary);
// Get a single trip
router.get("/:id", authMiddleware, getTripById);
router.put("/:id", authMiddleware, updateTrip);
router.delete("/:id", authMiddleware, deleteTrip);
router.post("/:id/duplicate", authMiddleware, duplicateTrip);

module.exports = router;
