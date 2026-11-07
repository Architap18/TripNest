const prisma = require("../config/prisma");

// Get recent activity for the logged-in user
const getRecentActivity = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            destination: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return res.status(200).json({
      message: "Recent activity fetched successfully",
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get recent activity error:", error);

    return res.status(500).json({
      message: "Could not fetch recent activity",
    });
  }
};

module.exports = {
  getRecentActivity,
};