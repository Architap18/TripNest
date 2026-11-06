
const prisma = require("../config/prisma");

const canAccessTrip = async (tripId, userId) => {
  return prisma.trip.findFirst({
    where: {
      id: tripId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true, ownerId: true },
  });
};

const canEditTrip = async (tripId, userId) => {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              role: "EDITOR",
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  return trip;
};

// GET ITINERARY
const getItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await canAccessTrip(tripId, req.user.userId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const items = await prisma.itineraryItem.findMany({
      where: { tripId },
      orderBy: [
        { dateTime: "asc" },
        { sortOrder: "asc" },
      ],
    });

    return res.status(200).json({
      message: "Itinerary fetched successfully",
      items,
    });
  } catch (error) {
    console.error("Get itinerary error:", error);
    return res.status(500).json({
      message: "Could not fetch itinerary",
    });
  }
};

// CREATE ITINERARY ITEM
const createItineraryItem = async (req, res) => {
  try {
    const { tripId } = req.params;
    const {
      title,
      description,
      location,
      dateTime,
      duration,
      category,
    } = req.body;

    const trip = await canEditTrip(tripId, req.user.userId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found or you don't have editing permission",
      });
    }

    if (!title?.trim() || !dateTime) {
      return res.status(400).json({
        message: "Title and date/time are required",
      });
    }

    const parsedDate = new Date(dateTime);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid date and time",
      });
    }

    if (
      duration !== undefined &&
      duration !== null &&
      (!Number.isInteger(Number(duration)) || Number(duration) <= 0)
    ) {
      return res.status(400).json({
        message: "Duration must be a positive number of minutes",
      });
    }

    const item = await prisma.itineraryItem.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        dateTime: parsedDate,
        duration: duration ? Number(duration) : null,
        category: category?.trim() || null,
        tripId,
        createdById: req.user.userId,
      },
    });

    await prisma.activity.create({
      data: {
        action: "ITINERARY_CREATED",
        details: `Added ${item.title} to the itinerary`,
        userId: req.user.userId,
        tripId,
      },
    });

    return res.status(201).json({
      message: "Itinerary item created successfully",
      item,
    });
  } catch (error) {
    console.error("Create itinerary item error:", error);
    return res.status(500).json({
      message: "Could not create itinerary item",
    });
  }
};

// UPDATE ITINERARY ITEM
const updateItineraryItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;

    const trip = await canEditTrip(tripId, req.user.userId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found or you don't have editing permission",
      });
    }

    const existing = await prisma.itineraryItem.findFirst({
      where: { id: itemId, tripId },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Itinerary item not found",
      });
    }

    const {
      title,
      description,
      location,
      dateTime,
      duration,
      category,
    } = req.body;

    const data = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      data.title = title.trim();
    }

    if (description !== undefined) {
      data.description = description?.trim() || null;
    }

    if (location !== undefined) {
      data.location = location?.trim() || null;
    }

    if (dateTime !== undefined) {
      const parsedDate = new Date(dateTime);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date/time" });
      }

      data.dateTime = parsedDate;
    }

    if (duration !== undefined) {
      if (
        duration !== null &&
        (!Number.isInteger(Number(duration)) || Number(duration) <= 0)
      ) {
        return res.status(400).json({
          message: "Duration must be a positive number of minutes",
        });
      }

      data.duration = duration === null ? null : Number(duration);
    }

    if (category !== undefined) {
      data.category = category?.trim() || null;
    }

    const item = await prisma.itineraryItem.update({
      where: { id: itemId },
      data,
    });

    return res.status(200).json({
      message: "Itinerary item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update itinerary item error:", error);
    return res.status(500).json({
      message: "Could not update itinerary item",
    });
  }
};

// DELETE ITINERARY ITEM
const deleteItineraryItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;

    const trip = await canEditTrip(tripId, req.user.userId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found or you don't have editing permission",
      });
    }

    const existing = await prisma.itineraryItem.findFirst({
      where: { id: itemId, tripId },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Itinerary item not found",
      });
    }

    await prisma.itineraryItem.delete({
      where: { id: itemId },
    });

    return res.status(200).json({
      message: "Itinerary item deleted successfully",
    });
  } catch (error) {
    console.error("Delete itinerary item error:", error);
    return res.status(500).json({
      message: "Could not delete itinerary item",
    });
  }
};

module.exports = {
  getItinerary,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
};
