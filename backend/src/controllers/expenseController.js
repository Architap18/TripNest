
const prisma = require("../config/prisma");

const categories = [
  "TRANSPORT",
  "ACCOMMODATION",
  "FOOD",
  "ACTIVITIES",
  "SHOPPING",
  "OTHER",
];

const findAccessibleTrip = (tripId, userId, requireEdit = false) => {
  const memberCondition = requireEdit
    ? {
        some: {
          userId,
          role: "EDITOR",
        },
      }
    : {
        some: { userId },
      };

  return prisma.trip.findFirst({
    where: {
      id: tripId,
      OR: [
        { ownerId: userId },
        { members: memberCondition },
      ],
    },
  });
};

// GET EXPENSES AND SUMMARY
const getExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;

    const trip = await findAccessibleTrip(tripId, userId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { spentAt: "desc" },
    });

    const totalSpent = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    const categoryTotals = expenses.reduce((result, expense) => {
      result[expense.category] =
        (result[expense.category] || 0) + Number(expense.amount);

      return result;
    }, {});

    const budget = trip.budget === null ? null : Number(trip.budget);

    return res.status(200).json({
      message: "Expenses fetched successfully",
      expenses,
      summary: {
        budget,
        totalSpent,
        remaining:
          budget === null ? null : budget - totalSpent,
        categoryTotals,
        currency: trip.currency,
      },
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    return res.status(500).json({
      message: "Could not fetch expenses",
    });
  }
};

// CREATE EXPENSE
const createExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const {
      title,
      amount,
      category = "OTHER",
      description,
      spentAt,
    } = req.body;

    const trip = await findAccessibleTrip(
      tripId,
      req.user.userId,
      true
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found or you don't have editing permission",
      });
    }

    if (!title?.trim() || amount === undefined || amount === null || amount === "") {
      return res.status(400).json({
        message: "Title and amount are required",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    if (!categories.includes(category)) {
      return res.status(400).json({
        message: "Invalid expense category",
      });
    }

    const parsedDate = spentAt ? new Date(spentAt) : new Date();

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid expense date",
      });
    }

    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        amount: numericAmount,
        category,
        description: description?.trim() || null,
        spentAt: parsedDate,
        tripId,
        userId: req.user.userId,
      },
    });

    await prisma.activity.create({
      data: {
        action: "EXPENSE_CREATED",
        details: `Added ${title.trim()} expense`,
        userId: req.user.userId,
        tripId,
      },
    });

    return res.status(201).json({
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    console.error("Create expense error:", error);
    return res.status(500).json({
      message: "Could not add expense",
    });
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;

    const trip = await findAccessibleTrip(
      tripId,
      req.user.userId,
      true
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found or you don't have editing permission",
      });
    }

    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, tripId },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    const {
      title,
      amount,
      category,
      description,
      spentAt,
    } = req.body;

    const data = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }
      data.title = title.trim();
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          message: "Amount must be greater than zero",
        });
      }

      data.amount = numericAmount;
    }

    if (category !== undefined) {
      if (!categories.includes(category)) {
        return res.status(400).json({
          message: "Invalid expense category",
        });
      }

      data.category = category;
    }

    if (description !== undefined) {
      data.description = description?.trim() || null;
    }

    if (spentAt !== undefined) {
      const parsedDate = new Date(spentAt);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid expense date",
        });
      }

      data.spentAt = parsedDate;
    }

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data,
    });

    return res.status(200).json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("Update expense error:", error);
    return res.status(500).json({
      message: "Could not update expense",
    });
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;

    const trip = await findAccessibleTrip(
      tripId,
      req.user.userId,
      true
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found or you don't have editing permission",
      });
    }

    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, tripId },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    return res.status(500).json({
      message: "Could not delete expense",
    });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
