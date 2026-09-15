const express = require("express");

const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware.js");


// ===============================
// CATEGORIES
// ===============================

router
  .route("/")
  .post(
    protect,
    authorize("admin", "owner", "pharmacist"),
    createCategory
  )
  .get(
    protect,
    getCategories
  );


// ===============================
// SINGLE CATEGORY
// ===============================

router
  .route("/:id")
  .get(
    protect,
    getCategory
  )
  .put(
    protect,
    authorize("admin", "owner", "pharmacist"),
    updateCategory
  )
  .delete(
    protect,
    authorize("admin", "owner", "pharmacist"),
    deleteCategory
  );

module.exports = router;