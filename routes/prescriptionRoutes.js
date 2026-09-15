const express = require("express");

const router = express.Router();

const {
  addPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
} = require("../controllers/prescriptionController");

const {
  protect,
} = require("../middleware/authMiddleware");

// =====================================================
// CREATE
// POST /api/prescriptions
// =====================================================

router.post(
  "/",
  protect,
  addPrescription
);

// =====================================================
// PATIENT HISTORY
// GET /api/prescriptions/patient/:patientId
// =====================================================

router.get(
  "/patient/:patientId",
  protect,
  getPrescriptionsByPatient
);

// =====================================================
// SINGLE PRESCRIPTION
// GET /api/prescriptions/:id
// =====================================================

router.get(
  "/:id",
  protect,
  getPrescriptionById
);

// =====================================================
// UPDATE
// PUT /api/prescriptions/:id
// =====================================================

router.put(
  "/:id",
  protect,
  updatePrescription
);

// =====================================================
// DELETE
// DELETE /api/prescriptions/:id
// =====================================================

router.delete(
  "/:id",
  protect,
  deletePrescription
);

module.exports = router;