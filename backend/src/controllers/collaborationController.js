
const prisma = require("../config/prisma");

// GET TRIP MEMBERS
const getMembers = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;

    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json({
      message: "Trip members fetched successfully",
      owner: trip.owner,
      members: trip.members,
    });
  } catch (error) {
    console.error("Get members error:", error);
    return res.status(500).json({
      message: "Could not fetch trip members",
    });
  }
};

// INVITE AN EXISTING USER
const inviteMember = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { email, role = "VIEWER" } = req.body;
    const userId = req.user.userId;

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, ownerId: userId },
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found or only the owner can invite members",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!["EDITOR", "VIEWER"].includes(role)) {
      return res.status(400).json({
        message: "Role must be EDITOR or VIEWER",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const invitedUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    if (!invitedUser) {
      return res.status(404).json({
        message: "No TripNest account exists with this email",
      });
    }

    if (invitedUser.id === userId) {
      return res.status(400).json({
        message: "You are already the owner of this trip",
      });
    }

    const existingMember = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({
        message: "This user is already a trip member",
      });
    }

    const member = await prisma.tripMember.create({
      data: {
        tripId,
        userId: invitedUser.id,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await prisma.activity.create({
      data: {
        action: "MEMBER_ADDED",
        details: `${invitedUser.name} was added to the trip`,
        userId,
        tripId,
      },
    });

    return res.status(201).json({
      message: "Member added successfully",
      member,
    });
  } catch (error) {
    console.error("Invite member error:", error);
    return res.status(500).json({
      message: "Could not add member",
    });
  }
};

// REMOVE MEMBER
const removeMember = async (req, res) => {
  try {
    const { tripId, memberId } = req.params;
    const userId = req.user.userId;

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, ownerId: userId },
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found or only the owner can remove members",
      });
    }

    const member = await prisma.tripMember.findFirst({
      where: {
        id: memberId,
        tripId,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!member) {
      return res.status(404).json({
        message: "Trip member not found",
      });
    }

    await prisma.tripMember.delete({
      where: { id: memberId },
    });

    await prisma.activity.create({
      data: {
        action: "MEMBER_REMOVED",
        details: `${member.user.name} was removed from the trip`,
        userId,
        tripId,
      },
    });

    return res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return res.status(500).json({
      message: "Could not remove member",
    });
  }
};

module.exports = {
  getMembers,
  inviteMember,
  removeMember,
};
