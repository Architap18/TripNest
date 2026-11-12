
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { put, get, del } = require("@vercel/blob");
const { Readable } = require("stream");

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        location: true,
        avatarUrl: true,
        createdAt: true,
        preferences: true,
        notificationSettings: true,
        coverImageUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { avatarUrl, coverImageUrl, ...profile } = user;

    return res.json({
      profile: {
        ...profile,
        avatarUrl: avatarUrl ? "/api/profile/avatar" : null,
        coverUrl: coverImageUrl ? "/api/profile/cover" : null,
      },
    });
      
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Could not fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, location } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        NOT: { id: req.user.userId },
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "This email is already being used",
      });
    }

    let parsedDate = null;

    if (dateOfBirth) {
      parsedDate = new Date(dateOfBirth);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date of birth",
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null,
        dateOfBirth: parsedDate,
        location: location?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        location: true,
        createdAt: true,
      },
    });

    return res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(500).json({ message: "Could not update profile" });
  }
};

const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [ownedTrips, memberships, savedPlaces, expenseTotal] =
      await Promise.all([
        prisma.trip.findMany({
          where: { ownerId: userId },
          select: { id: true },
        }),
        prisma.tripMember.findMany({
          where: { userId },
          select: {
            tripId: true,
            trip: {
              select: { ownerId: true },
            },
          },
        }),
        prisma.savedPlace.count({
          where: { userId },
        }),
        prisma.expense.aggregate({
          where: { userId },
          _sum: { amount: true },
        }),
      ]);

    const tripIds = new Set([
      ...ownedTrips.map((trip) => trip.id),
      ...memberships.map((member) => member.tripId),
    ]);

    const participantRows = tripIds.size
      ? await prisma.tripMember.findMany({
          where: { tripId: { in: [...tripIds] } },
          select: { userId: true },
        })
      : [];

    const ownerIds = memberships.map((member) => member.trip.ownerId);
    const buddyIds = new Set([
      ...participantRows.map((member) => member.userId),
      ...ownerIds,
    ]);

    buddyIds.delete(userId);

    return res.json({
      stats: {
        tripsPlanned: tripIds.size,
        savedPlaces,
        travelBuddies: buddyIds.size,
        totalExpenses: Number(expenseTotal._sum.amount || 0),
      },
    });
  } catch (error) {
    console.error("Profile stats error:", error);
    return res.status(500).json({
      message: "Could not fetch profile statistics",
    });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const {
      travelStyle,
      budget,
      destination,
      interests,
    } = req.body;

    if (
      interests !== undefined &&
      (!Array.isArray(interests) ||
        !interests.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({ message: "Invalid interests" });
    }

    const preferences = await prisma.travelPreference.upsert({
      where: { userId: req.user.userId },
      create: {
        userId: req.user.userId,
        travelStyle: travelStyle || "Adventure",
        budget: budget || "Moderate",
        destination: destination || "Mountains",
        interests: interests || [],
      },
      update: {
        ...(travelStyle !== undefined && { travelStyle }),
        ...(budget !== undefined && { budget }),
        ...(destination !== undefined && { destination }),
        ...(interests !== undefined && { interests }),
      },
    });

    return res.json({
      message: "Travel preferences saved",
      preferences,
    });
  } catch (error) {
    console.error("Preferences error:", error);
    return res.status(500).json({
      message: "Could not save travel preferences",
    });
  }
};

const updateNotifications = async (req, res) => {
  try {
    const allowedKeys = [
      "tripUpdates",
      "itineraryReminders",
      "collaboration",
      "promotionalEmails",
    ];

    const data = {};

    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        if (typeof req.body[key] !== "boolean") {
          return res.status(400).json({
            message: `${key} must be true or false`,
          });
        }

        data[key] = req.body[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "No notification settings provided",
      });
    }

    const settings = await prisma.notificationSetting.upsert({
      where: { userId: req.user.userId },
      create: {
        userId: req.user.userId,
        ...data,
      },
      update: data,
    });

    return res.json({
      message: "Notification settings saved",
      settings,
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return res.status(500).json({
      message: "Could not save notification settings",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current and new passwords are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must contain at least 8 characters",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);

    if (!valid) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return res.status(500).json({
      message: "Could not change password",
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select an image" });
    }

    const pathname = `profile-avatars/${req.user.userId}/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const blob = await put(pathname, req.file.buffer, {
      access: "private",
      addRandomSuffix: true,
      contentType: req.file.mimetype,
    });

    const previous = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { avatarUrl: true },
    });

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl: blob.pathname },
    });

    if (previous?.avatarUrl) {
      try {
        await del(previous.avatarUrl, { access: "private" });
      } catch (cleanupError) {
        console.error("Old avatar cleanup error:", cleanupError);
      }
    }

    return res.json({
      message: "Profile picture updated",
      avatarUrl: "/api/profile/avatar",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return res.status(500).json({
      message: "Could not upload profile picture",
    });
  }
};

const getAvatar = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { avatarUrl: true },
    });

    if (!user?.avatarUrl) {
      return res.status(404).json({ message: "No profile picture found" });
    }

    const result = await get(user.avatarUrl, { access: "private" });

    if (!result || result.statusCode !== 200) {
      return res.status(404).json({ message: "Profile picture not found" });
    }

    res.setHeader("Content-Type", result.blob.contentType);
    res.setHeader("Cache-Control", "private, max-age=300");

    Readable.fromWeb(result.stream).pipe(res);
  } catch (error) {
    console.error("Get avatar error:", error);
    return res.status(500).json({
      message: "Could not load profile picture",
    });
  }
};

const uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select a cover image" });
    }

    const pathname = `profile-covers/${req.user.userId}/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const blob = await put(pathname, req.file.buffer, {
      access: "private",
      addRandomSuffix: true,
      contentType: req.file.mimetype,
    });

    const previous = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { coverImageUrl: true },
    });

    try {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { coverImageUrl: blob.pathname },
      });
    } catch (error) {
      await del(blob.pathname, { access: "private" }).catch(() => {});
      throw error;
    }

    if (previous?.coverImageUrl) {
      try {
        await del(previous.coverImageUrl, { access: "private" });
      } catch (error) {
        console.error("Old cover cleanup error:", error);
      }
    }

    return res.json({
      message: "Cover image updated successfully",
      coverUrl: "/api/profile/cover",
    });
  } catch (error) {
    console.error("Cover upload error:", error);
    return res.status(500).json({
      message: "Could not upload cover image",
    });
  }
};

const getCover = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { coverImageUrl: true },
    });

    if (!user?.coverImageUrl) {
      return res.status(404).json({ message: "No cover image found" });
    }

    const result = await get(user.coverImageUrl, { access: "private" });

    if (!result || result.statusCode !== 200) {
      return res.status(404).json({ message: "Cover image not found" });
    }

    res.setHeader("Content-Type", result.blob.contentType);
    res.setHeader("Cache-Control", "private, max-age=300");

    Readable.fromWeb(result.stream).pipe(res);
  } catch (error) {
    console.error("Get cover error:", error);
    return res.status(500).json({
      message: "Could not load cover image",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getProfileStats,
  updatePreferences,
  updateNotifications,
  changePassword,
  uploadAvatar,
  getAvatar,
  uploadCover,
  getCover,
};
