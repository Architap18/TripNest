
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getItinerary,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
} = require("../controllers/itineraryController");

router.use(authMiddleware);

router.get("/:tripId", getItinerary);
router.post("/:tripId", createItineraryItem);
router.put("/:tripId/:itemId", updateItineraryItem);
router.delete("/:tripId/:itemId", deleteItineraryItem);

module.exports = router;
