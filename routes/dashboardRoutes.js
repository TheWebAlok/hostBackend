const express = require("express");

const {
getDashboardStats,
} = require("../controllers/dashboardController.js");

const { protect } = require("../middleware/authMiddleware.js");
const router = express.Router();

// Dashboard Statistics - Protected Route
router.get("/", protect, getDashboardStats);

module.exports = router;
