const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================================
// UPLOAD FOLDER (created automatically if missing)
// =====================================================

const uploadDir = path.join(__dirname, "..", "uploads", "doctors");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// =====================================================
// STORAGE CONFIG
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `doctor-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;

    cb(null, uniqueName);
  },
});

// =====================================================
// FILE FILTER - IMAGES ONLY
// =====================================================

const allowedTypes = /jpeg|jpg|png|webp/;

const fileFilter = (req, file, cb) => {
  const isValidExt = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const isValidMime = allowedTypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed"));
  }
};

// =====================================================
// EXPORT MULTER INSTANCE
// =====================================================

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;

// Helper to safely delete an old photo file when replacing/removing a doctor
const deletePhotoFile = (photoPath) => {
  if (!photoPath) return;

  // photoPath is stored as "/uploads/doctors/filename.jpg"
  const absolutePath = path.join(__dirname, "..", photoPath);

  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete old doctor photo:", err.message);
    }
  });
};

module.exports.deletePhotoFile = deletePhotoFile;