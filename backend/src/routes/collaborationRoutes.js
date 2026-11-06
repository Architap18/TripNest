
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMembers,
  inviteMember,
  removeMember,
} = require("../controllers/collaborationController");

router.use(authMiddleware);

router.get("/:tripId", getMembers);
router.post("/:tripId/invite", inviteMember);
router.delete("/:tripId/members/:memberId", removeMember);

module.exports = router;
