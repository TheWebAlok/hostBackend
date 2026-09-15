const express = require("express");

const router = express.Router();

const {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
} = require("../controllers/storeController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");


// ======================================================
// STORE LIST
// ======================================================

// GET    /api/stores
// POST   /api/stores

router
  .route("/")
  .post(
    protect,
    authorize("admin", "owner"),
    createStore
  )
  .get(
    protect,
    getStores
  );


// ======================================================
// SINGLE STORE
// ======================================================

// GET    /api/stores/:id
// PUT    /api/stores/:id
// DELETE /api/stores/:id

router
  .route("/:id")
  .get(
    protect,
    getStore
  )
  .put(
    protect,
    authorize("admin", "owner"),
    updateStore
  )
  .delete(
    protect,
    authorize("admin", "owner"),
    deleteStore
  );


module.exports = router;