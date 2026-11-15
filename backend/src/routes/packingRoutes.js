
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getPackingItems,
  addPackingItem,
  updatePackingItem,
  deletePackingItem,
  addPackingItemsBatch,
  batchUpdatePackingItems,
} = require("../controllers/packingController");

router.use(authMiddleware);

router.get("/:tripId", getPackingItems);
router.post("/:tripId", addPackingItem);
router.post("/:tripId/batch", addPackingItemsBatch);
router.patch("/:tripId/batch", batchUpdatePackingItems);
router.patch("/:tripId/:itemId", updatePackingItem);
router.delete("/:tripId/:itemId", deletePackingItem);

module.exports = router;
