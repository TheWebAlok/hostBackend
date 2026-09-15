const express = require("express");

const router = express.Router();

const {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router
  .route("/")
  .post(
    protect,
    authorize("admin", "owner", "pharmacist"),
    createSupplier
  )
  .get(
    protect,
    getSuppliers
  );

router
  .route("/:id")
  .get(
    protect,
    getSupplier
  )
  .put(
    protect,
    authorize("admin", "owner", "pharmacist"),
    updateSupplier
  )
  .delete(
    protect,
    authorize("admin", "owner", "pharmacist"),
    deleteSupplier
  );

module.exports = router;