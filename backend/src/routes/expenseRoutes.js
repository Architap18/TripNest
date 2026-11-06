
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

router.use(authMiddleware);

router.get("/:tripId", getExpenses);
router.post("/:tripId", createExpense);
router.put("/:tripId/:expenseId", updateExpense);
router.delete("/:tripId/:expenseId", deleteExpense);

module.exports = router;
