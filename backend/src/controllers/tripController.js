
const prisma = require("../config/prisma");

// creating new trip
const createTrip = async (req, res) => {
  try {
    const {
      title,
      destination,
      description,
      coverImage,
      startDate,
      endDate,
      budget,
      currency,
    } = req.body;

    // Validate required fields
    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({
        message: "Title, destination, start date and end date are required",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Please provide valid dates",
      });
    }

    if (end < start) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    // Validate budget if provided
    if (
      budget !== undefined &&
      budget !== null &&
      (budget === "" || !Number.isFinite(Number(budget)) || Number(budget) < 0)
    ) {
      return res.status(400).json({
        message: "Budget must be a valid non-negative number",
      });
    }

    // Create trip in database
    const trip = await prisma.trip.create({
      data: {
        title: title.trim(),
        destination: destination.trim(),
        description: description?.trim() || null,
        coverImage: coverImage || null,
        startDate: start,
        endDate: end,
        budget:
          budget !== undefined && budget !== null && budget !== ""
            ? Number(budget)
            : null,
        currency: currency || "INR",

        // Get owner ID from authenticated user
        ownerId: req.user.userId,
      },
    });
    // Record trip creation in Recent Activity
    await prisma.activity.create({
      data: {
        action: "TRIP_CREATED",
        details: `Created a trip to ${trip.destination}`,
        userId: req.user.userId,
        tripId: trip.id,
      },
    });
    return res.status(201).json({
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error("Create trip error:", error);

    return res.status(500).json({
      message: "Could not create trip",
    });
  }
};

// Get all trips for the authenticated user
const getMyTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        ownerId: req.user.userId,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return res.status(200).json({
      message: "Trips fetched successfully",
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Get trips error:", error);

    return res.status(500).json({
      message: "Could not fetch trips",
    });
  }
};
//getting trips by id
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        id: id,
        ownerId: req.user.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    return res.status(200).json({
      message: "Trip fetched successfully",
      trip,
    });
  } catch (error) {
    console.error("Get trip error:", error);

    return res.status(500).json({
      message: "Could not fetch trip",
    });
  }
};
module.exports = {
  createTrip,
  getMyTrips,
  getTripById,
};
