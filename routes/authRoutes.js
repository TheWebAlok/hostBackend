const express = require("express");

const {
  registerAdmin,
  login,
} = require("../controllers/authController.js");

const router = express.Router();

// Register Admin
router.post("/register", registerAdmin);

// Login (works for both Admin and Doctor)
router.post("/login", login);

module.exports = router;