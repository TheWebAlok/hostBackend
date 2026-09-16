
const express = require("express");

const {
  addDoctor,
  getDoctors,
  getPublicDoctors,
  getDoctorById,
  getMyProfile,
  updateDoctor,
  updateMyProfile,
  deleteDoctor,
} = require("../controllers/doctorController.js");

// Auth Middleware
const { protect } = require("../middleware/authMiddleware.js");

// Upload Middleware
const upload = require("../middleware/upload.js");

const router = express.Router();

// =====================================================
// PUBLIC - "OUR DOCTORS" PAGE (NO AUTH)
// =====================================================

router.get("/public", getPublicDoctors);

// =====================================================
// DOCTOR SELF PROFILE
// =====================================================

router.get("/me", protect, getMyProfile);

router.put(
  "/me",
  protect,
  upload.single("photo"),
  updateMyProfile
);

// =====================================================
// ADMIN / PROTECTED DOCTOR MANAGEMENT
// =====================================================

router.post(
  "/",
  protect,
  upload.single("photo"),
  addDoctor
);

router.get(
  "/",
  protect,
  getDoctors
);

router.get(
  "/:id",
  
  getDoctorById
);

router.put(
  "/:id",
  protect,
  upload.single("photo"),
  updateDoctor
);

router.delete(
  "/:id",
  protect,
  deleteDoctor
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;

