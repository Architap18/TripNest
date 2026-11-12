
const prisma = require("../config/prisma");

// GET /api/saved-places
const getSavedPlaces = async (req, res) => {
  try {
    const savedPlaces = await prisma.savedPlace.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ savedPlaces });
  } catch (error) {
    console.error("Get saved places error:", error);
    return res.status(500).json({
      message: "Could not fetch saved places",
    });
  }
};

// POST /api/saved-places
const addSavedPlace = async (req, res) => {
  try {
    const { name, destination, description, imageUrl } = req.body;

    if (!name?.trim() || !destination?.trim()) {
      return res.status(400).json({
        message: "Name and destination are required",
      });
    }

    const existing = await prisma.savedPlace.findUnique({
      where: {
        userId_name_destination: {
          userId: req.user.userId,
          name: name.trim(),
          destination: destination.trim(),
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "This place is already saved",
        savedPlace: existing,
      });
    }

    const savedPlace = await prisma.savedPlace.create({
      data: {
        name: name.trim(),
        destination: destination.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      message: "Place saved successfully",
      savedPlace,
    });
  } catch (error) {
    console.error("Add saved place error:", error);
    return res.status(500).json({
      message: "Could not save place",
    });
  }
};

// DELETE /api/saved-places/:id
const deleteSavedPlace = async (req, res) => {
  try {
    const { id } = req.params;

    const savedPlace = await prisma.savedPlace.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!savedPlace) {
      return res.status(404).json({
        message: "Saved place not found",
      });
    }

    await prisma.savedPlace.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Place removed from saved places",
    });
  } catch (error) {
    console.error("Delete saved place error:", error);
    return res.status(500).json({
      message: "Could not remove saved place",
    });
  }
};

module.exports = {
  getSavedPlaces,
  addSavedPlace,
  deleteSavedPlace,
};
