const Store = require("../models/Store");
const Admin = require("../models/Admin");


// ======================================================
// CREATE STORE
// ======================================================

// @desc    Create a new pharmacy store
// @route   POST /api/stores
// @access  Private

exports.createStore = async (req, res) => {
  try {
    console.log("CREATE STORE USER:", req.user);
    console.log("CREATE STORE BODY:", req.body);

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication token",
      });
    }

    const store = await Store.create({
      name: req.body.name,
      code: req.body.code,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      managerName: req.body.managerName,
      status: req.body.status || "active",

      // Logged-in Admin ID
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: store,
    });

  } catch (error) {
    console.error("CREATE STORE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET ALL STORES
// ======================================================

// @desc    Get all pharmacy stores
// @route   GET /api/stores
// @access  Private

exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate("owner", "name email");

    return res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });

  } catch (error) {
    console.error("GET STORES ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET SINGLE STORE
// ======================================================

// @desc    Get single pharmacy store
// @route   GET /api/stores/:id
// @access  Private

exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate("owner", "name email");

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: store,
    });

  } catch (error) {
    console.error("GET STORE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// UPDATE STORE
// ======================================================

// @desc    Update pharmacy store
// @route   PUT /api/stores/:id
// @access  Private

exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        code: req.body.code,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        managerName: req.body.managerName,
        status: req.body.status || "active",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Store updated successfully",
      data: store,
    });

  } catch (error) {
    console.error("UPDATE STORE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// DELETE STORE
// ======================================================

// @desc    Delete pharmacy store
// @route   DELETE /api/stores/:id
// @access  Private

exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(
      req.params.id
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Store deleted successfully",
      data: {},
    });

  } catch (error) {
    console.error("DELETE STORE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};