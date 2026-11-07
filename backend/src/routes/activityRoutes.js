const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getRecentActivity,
} = require("../controllers/activityController");

router.get("/", authMiddleware, getRecentActivity);

module.exports = router;