const express = require("express");

const router = express.Router();

const {
  createMedicine,
  getMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStockMedicines,
  getExpiringMedicines,
} = require("../controllers/medicineController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// ALERTS
// ======================================================

router.get(
  "/alerts/low-stock",
  protect,
  getLowStockMedicines
);

router.get(
  "/alerts/expiring",
  protect,
  getExpiringMedicines
);

// ======================================================
// MEDICINES
// ======================================================

// CREATE - Admin / Owner / Pharmacist
router.post(
  "/",
  protect,
  authorize(
    "admin",
    "owner",
    "pharmacist"
  ),
  createMedicine
);

// GET ALL MEDICINES
// PUBLIC - LOGIN KI ZAROORAT NAHI
router.get(
  "/",
  getMedicines
);

// ======================================================
// SINGLE MEDICINE
// ======================================================

// PUBLIC - LOGIN KI ZAROORAT NAHI
router.get(
  "/:id",
  getMedicine
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize(
    "admin",
    "owner",
    "pharmacist"
  ),
  updateMedicine
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize(
    "admin",
    "owner",
    "pharmacist"
  ),
  deleteMedicine
);

module.exports = router;