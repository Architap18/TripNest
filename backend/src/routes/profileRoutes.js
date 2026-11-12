
const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");

const {
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
} = require("../controllers/profileController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return callback(new Error("Only JPG, PNG and WEBP images are allowed"));
    }

    callback(null, true);
  },
});

router.use(authMiddleware);

router.get("/", getProfile);
router.put("/", updateProfile);
router.get("/stats", getProfileStats);

router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.get("/avatar", getAvatar);

router.post("/cover", upload.single("cover"), uploadCover);
router.get("/cover", getCover);

router.put("/preferences", updatePreferences);
router.put("/notifications", updateNotifications);
router.put("/password", changePassword);

router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.get("/avatar", getAvatar);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5 MB or smaller"
          : error.message,
    });
  }

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
});

module.exports = router;
