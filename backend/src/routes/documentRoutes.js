
const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");

const {
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, callback) => {
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Only PDF, JPG, PNG and DOCX files are allowed"));
    }
  },
});

router.get("/:tripId", authMiddleware, getDocuments);

router.post(
  "/:tripId",
  authMiddleware,
  upload.single("document"),
  uploadDocument
);

router.get(
  "/:tripId/:documentId/download",
  authMiddleware,
  downloadDocument
);

router.delete(
  "/:tripId/:documentId",
  authMiddleware,
  deleteDocument
);

// Handle file upload errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "File size must be 10 MB or less"
          : error.message,
    });
  }

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
});

module.exports = router;
