
const prisma = require("../config/prisma");

const OLD_MOUNTAIN_FALLBACK =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900";

const getDestinationImage = async (destination) => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn("UNSPLASH_ACCESS_KEY is missing from backend .env");
    return null;
  }

  try {
    const params = new URLSearchParams({
      query: `${destination} India landmarks travel`,
      per_page: "1",
      orientation: "landscape",
      content_filter: "high",
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Unsplash API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    return data.results[0].urls.regular;
  } catch (error) {
    console.error("Destination image error:", error.message);
    return null;
  }
};

// CREATE TRIP
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

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({
        message: "Title, destination, start date and end date are required",
      });
    }

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

    if (
      budget !== undefined &&
      budget !== null &&
      (budget === "" ||
        !Number.isFinite(Number(budget)) ||
        Number(budget) < 0)
    ) {
      return res.status(400).json({
        message: "Budget must be a valid non-negative number",
      });
    }

    const cleanDestination = destination.trim();

    // Use a supplied cover image, otherwise fetch one from Unsplash.
    const finalCoverImage =
      coverImage?.trim() ||
      (await getDestinationImage(cleanDestination));

    const trip = await prisma.trip.create({
      data: {
        title: title.trim(),
        destination: cleanDestination,
        description: description?.trim() || null,
        coverImage: finalCoverImage,
        startDate: start,
        endDate: end,
        budget:
          budget !== undefined && budget !== null && budget !== ""
            ? Number(budget)
            : null,
        currency: currency || "INR",
        ownerId: req.user.userId,
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

// GET ALL TRIPS
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

    // Fill missing images and replace the old generic mountain fallback.
    const updatedTrips = await Promise.all(
      trips.map(async (trip) => {
        const needsImage =
          !trip.coverImage ||
          trip.coverImage === OLD_MOUNTAIN_FALLBACK;

        if (!needsImage) {
          return trip;
        }

        const image = await getDestinationImage(trip.destination);

        if (!image) {
          return trip;
        }

        return prisma.trip.update({
          where: {
            id: trip.id,
          },
          data: {
            coverImage: image,
          },
        });
      })
    );

    return res.status(200).json({
      message: "Trips fetched successfully",
      count: updatedTrips.length,
      trips: updatedTrips,
    });
  } catch (error) {
    console.error("Get trips error:", error);

    return res.status(500).json({
      message: "Could not fetch trips",
    });
  }
};

// GET TRIP BY ID
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        id,
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

// DELETE TRIP
const deleteTrip = async (req, res) => {
  try {
    const tripId = req.params.tripId || req.params.id;

    if (!tripId) {
      return res.status(400).json({
        message: "Trip ID is required",
      });
    }

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    if (trip.ownerId !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this trip",
      });
    }

    // Clean up any associated document files from blob storage if present
    try {
      const documents = await prisma.tripDocument.findMany({
        where: { tripId },
        select: { pathname: true },
      });

      if (documents.length > 0) {
        const { del } = require("@vercel/blob");
        await Promise.allSettled(
          documents.map((doc) => del(doc.pathname, { access: "private" }))
        );
      }
    } catch (blobError) {
      console.warn("Blob cleanup error during trip deletion:", blobError.message);
    }

    await prisma.trip.delete({
      where: {
        id: tripId,
      },
    });

    return res.status(200).json({
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Delete trip error:", error);

    return res.status(500).json({
      message: "Could not delete trip",
    });
  }
};

module.exports = {
  createTrip,
  getMyTrips,
  getTripById,
  deleteTrip,
};
