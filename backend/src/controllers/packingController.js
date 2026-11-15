
const prisma = require("../config/prisma");

const editableTrip = async (tripId, userId) => {
  return prisma.trip.findFirst({
    where: {
      id: tripId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              role: { in: ["OWNER", "EDITOR"] },
            },
          },
        },
      ],
    },
  });
};

const getPackingItems = async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.tripId,
        OR: [
          { ownerId: req.user.userId },
          { members: { some: { userId: req.user.userId } } },
        ],
      },
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const items = await prisma.packingItem.findMany({
      where: { tripId: trip.id },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ items });
  } catch (error) {
    console.error("Get packing items error:", error);
    return res.status(500).json({ message: "Could not fetch packing items" });
  }
};

const addPackingItem = async (req, res) => {
  try {
    const { name, category = "OTHER" } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Item name is required" });
    }

    const trip = await editableTrip(req.params.tripId, req.user.userId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found or you cannot edit it" });
    }

    const allowedCategories = [
      "CLOTHING", "TOILETRIES", "DOCUMENTS",
      "ELECTRONICS", "MEDICINE", "OTHER",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const item = await prisma.packingItem.create({
      data: {
        name: name.trim(),
        category,
        tripId: trip.id,
      },
    });

    return res.status(201).json({ item });
  } catch (error) {
    console.error("Add packing item error:", error);
    return res.status(500).json({ message: "Could not add packing item" });
  }
};

const updatePackingItem = async (req, res) => {
  try {
    const { name, category, isPacked } = req.body;
    const trip = await editableTrip(req.params.tripId, req.user.userId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found or you cannot edit it" });
    }

    const existing = await prisma.packingItem.findFirst({
      where: { id: req.params.itemId, tripId: trip.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Packing item not found" });
    }

    const allowedCategories = [
      "CLOTHING", "TOILETRIES", "DOCUMENTS",
      "ELECTRONICS", "MEDICINE", "OTHER",
    ];

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const item = await prisma.packingItem.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(category !== undefined && { category }),
        ...(isPacked !== undefined && { isPacked: Boolean(isPacked) }),
      },
    });

    return res.status(200).json({ item });
  } catch (error) {
    console.error("Update packing item error:", error);
    return res.status(500).json({ message: "Could not update packing item" });
  }
};

const deletePackingItem = async (req, res) => {
  try {
    const trip = await editableTrip(req.params.tripId, req.user.userId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found or you cannot edit it" });
    }

    const existing = await prisma.packingItem.findFirst({
      where: { id: req.params.itemId, tripId: trip.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Packing item not found" });
    }

    await prisma.packingItem.delete({ where: { id: existing.id } });

    return res.status(200).json({ message: "Packing item deleted" });
  } catch (error) {
    console.error("Delete packing item error:", error);
    return res.status(500).json({ message: "Could not delete packing item" });
  }
};

const addPackingItemsBatch = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "An array of items is required" });
    }

    const trip = await editableTrip(req.params.tripId, req.user.userId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found or you cannot edit it" });
    }

    const allowedCategories = [
      "CLOTHING",
      "TOILETRIES",
      "DOCUMENTS",
      "ELECTRONICS",
      "MEDICINE",
      "OTHER",
    ];

    const validItems = items
      .filter((it) => it && it.name && it.name.trim())
      .map((it) => ({
        name: it.name.trim(),
        category: allowedCategories.includes(it.category) ? it.category : "OTHER",
        tripId: trip.id,
      }));

    if (validItems.length === 0) {
      return res.status(400).json({ message: "No valid items to add" });
    }

    await prisma.packingItem.createMany({
      data: validItems,
    });

    const allItems = await prisma.packingItem.findMany({
      where: { tripId: trip.id },
      orderBy: { createdAt: "asc" },
    });

    return res.status(201).json({
      message: `${validItems.length} items added successfully`,
      items: allItems,
    });
  } catch (error) {
    console.error("Batch add packing items error:", error);
    return res.status(500).json({ message: "Could not add packing items" });
  }
};

const batchUpdatePackingItems = async (req, res) => {
  try {
    const { isPacked, clearAll } = req.body;
    const trip = await editableTrip(req.params.tripId, req.user.userId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found or you cannot edit it" });
    }

    if (clearAll) {
      await prisma.packingItem.deleteMany({
        where: { tripId: trip.id },
      });
      return res.status(200).json({ message: "All packing items cleared", items: [] });
    }

    if (isPacked !== undefined) {
      await prisma.packingItem.updateMany({
        where: { tripId: trip.id },
        data: { isPacked: Boolean(isPacked) },
      });
    }

    const allItems = await prisma.packingItem.findMany({
      where: { tripId: trip.id },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ message: "Packing items updated", items: allItems });
  } catch (error) {
    console.error("Batch update packing items error:", error);
    return res.status(500).json({ message: "Could not update packing items" });
  }
};

module.exports = {
  getPackingItems,
  addPackingItem,
  updatePackingItem,
  deletePackingItem,
  addPackingItemsBatch,
  batchUpdatePackingItems,
};
