
const express = require("express");
const router = express.Router();

const {
  getSavedPlaces,
  addSavedPlace,
  deleteSavedPlace,
} = require("../controllers/savedPlaceController");

const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", getSavedPlaces);
router.post("/", addSavedPlace);
router.delete("/:id", deleteSavedPlace);

module.exports = router;
