
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getPackingItems,
  addPackingItem,
  updatePackingItem,
  deletePackingItem,
} = require("../controllers/packingController");

router.use(authMiddleware);

router.get("/:tripId", getPackingItems);
router.post("/:tripId", addPackingItem);
router.patch("/:tripId/:itemId", updatePackingItem);
router.delete("/:tripId/:itemId", deletePackingItem);

module.exports = router;
