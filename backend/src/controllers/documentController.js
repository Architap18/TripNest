
const prisma = require("../config/prisma");
const { put, get, del } = require("@vercel/blob");
const { Readable } = require("stream");

// Check whether the logged-in user belongs to this trip.
const getTripAccess = async (tripId, userId) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      members: true,
    },
  });

  if (!trip) return null;

  const isOwner = trip.ownerId === userId;

  const membership = trip.members.find(
    (member) => member.userId === userId
  );

  return {
    trip,
    isMember: isOwner || Boolean(membership),
    canEdit: isOwner || membership?.role === "EDITOR",
  };
};

// GET /api/documents/:tripId
const getDocuments = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;

    const access = await getTripAccess(tripId, userId);

    if (!access) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    if (!access.isMember) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const documents = await prisma.tripDocument.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        contentType: true,
        size: true,
        createdAt: true,
        uploadedBy: {
          select: { name: true },
        },
      },
    });

    return res.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      message: "Could not load documents",
    });
  }
};

// POST /api/documents/:tripId
const uploadDocument = async (req, res) => {
  let uploadedPathname;

  try {
    const { tripId } = req.params;
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Please select a file",
      });
    }

    const access = await getTripAccess(tripId, userId);

    if (!access) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    if (!access.canEdit) {
      return res.status(403).json({
        message: "You cannot upload documents to this trip",
      });
    }

    const safeName = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const pathname = `trip-documents/${tripId}/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file.buffer, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.mimetype,
    });

    uploadedPathname = blob.pathname;

    const document = await prisma.tripDocument.create({
      data: {
        fileName: file.originalname,
        blobUrl: blob.url,
        pathname: blob.pathname,
        contentType: file.mimetype,
        size: file.size,
        tripId,
        uploadedById: userId,
      },
      select: {
        id: true,
        fileName: true,
        contentType: true,
        size: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    if (uploadedPathname) {
      try {
        await del(uploadedPathname, {
          access: "private",
        });
      } catch (deleteError) {
        console.error("Blob cleanup error:", deleteError);
      }
    }

    console.error("Upload document error:", error);

    return res.status(500).json({
      message: "Could not upload document",
    });
  }
};

// GET /api/documents/:tripId/:documentId/download
// GET /api/documents/:tripId/:documentId/download?preview=true
const downloadDocument = async (req, res) => {
  try {
    const { tripId, documentId } = req.params;
    const userId = req.user.userId;

    const access = await getTripAccess(tripId, userId);

    if (!access || !access.isMember) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const document = await prisma.tripDocument.findFirst({
      where: {
        id: documentId,
        tripId,
      },
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // Retrieve the file from private Vercel Blob storage.
    const result = await get(document.pathname, {
      access: "private",
    });

    if (!result || result.statusCode !== 200) {
      return res.status(404).json({
        message: "File not found in storage",
      });
    }

    const safeFileName = document.fileName.replace(
      /["\r\n]/g,
      "_"
    );

    // Preview is supported for PDF and image files.
    const isPreview = req.query.preview === "true";

    const isPreviewable =
      document.contentType === "application/pdf" ||
      document.contentType.startsWith("image/");

    const disposition =
      isPreview && isPreviewable
        ? "inline"
        : "attachment";

    res.setHeader("Content-Type", document.contentType);

    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${safeFileName}"`
    );

    res.setHeader("Content-Length", document.size);

    res.setHeader("Cache-Control", "private, no-store");

    res.setHeader("X-Content-Type-Options", "nosniff");

    // Stream the private file to the browser.
    Readable.fromWeb(result.stream).pipe(res);

  } catch (error) {
    console.error("Download document error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Could not download document",
      });
    }

    res.destroy(error);
  }
};

// DELETE /api/documents/:tripId/:documentId
const deleteDocument = async (req, res) => {
  try {
    const { tripId, documentId } = req.params;
    const userId = req.user.userId;

    const access = await getTripAccess(tripId, userId);

    if (!access) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    if (!access.canEdit) {
      return res.status(403).json({
        message: "You cannot delete documents from this trip",
      });
    }

    const document = await prisma.tripDocument.findFirst({
      where: {
        id: documentId,
        tripId,
      },
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    await del(document.pathname, {
      access: "private",
    });

    await prisma.tripDocument.delete({
      where: { id: documentId },
    });

    return res.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
      message: "Could not delete document",
    });
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
};
