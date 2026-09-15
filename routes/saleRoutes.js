const express = require("express");

const router = express.Router();

const {
  createSale,
  getSales,
  getSale,
} = require("../controllers/saleController");

const { protect } = require("../middleware/authMiddleware");

// =====================================================
// SALES
// =====================================================

// Create sale
// GET all sales
router
  .route("/")
  .post(protect, createSale)
  .get(protect, getSales);

// =====================================================
// SINGLE SALE
// =====================================================

router
  .route("/:id")
  .get(protect, getSale);

module.exports = router;