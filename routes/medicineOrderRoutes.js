const express = require("express");

const {
  createMedicineOrder,
  getMedicineOrders,
  getMedicineOrder,
  updateMedicineOrderStatus,
} = require("../controllers/medicineOrderController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// PATIENT - CREATE ORDER
// LOGIN KI ZAROORAT NAHI HAI
// =====================================================

router.post(
  "/",
  createMedicineOrder
);

// =====================================================
// PHARMACIST / ADMIN - GET ALL ORDERS
// =====================================================

router.get(
  "/",
  protect,
  authorize("admin", "owner", "pharmacist"),
  getMedicineOrders
);

// =====================================================
// PHARMACIST / ADMIN - SINGLE ORDER
// =====================================================

router.get(
  "/:id",
  protect,
  authorize("admin", "owner", "pharmacist"),
  getMedicineOrder
);

// =====================================================
// PHARMACIST / ADMIN - UPDATE ORDER STATUS
// =====================================================

router.put(
  "/:id/status",
  protect,
  authorize("admin", "owner", "pharmacist"),
  updateMedicineOrderStatus
);

module.exports = router;