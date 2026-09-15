const Supplier = require("../models/Supplier");

// ======================================================
// CREATE SUPPLIER
// ======================================================

// @desc    Create a new supplier
// @route   POST /api/suppliers
// @access  Private

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create({
      name: req.body.name,
      companyName: req.body.companyName || "",
      phone: req.body.phone,
      email: req.body.email || "",
      address: req.body.address || "",
      gstNumber: req.body.gstNumber || "",
    });

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    console.error("CREATE SUPPLIER ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET ALL SUPPLIERS
// ======================================================

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    console.error("GET SUPPLIERS ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET SINGLE SUPPLIER
// ======================================================

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error("GET SUPPLIER ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// UPDATE SUPPLIER
// ======================================================

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        companyName: req.body.companyName || "",
        phone: req.body.phone,
        email: req.body.email || "",
        address: req.body.address || "",
        gstNumber: req.body.gstNumber || "",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier,
    });
  } catch (error) {
    console.error("UPDATE SUPPLIER ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// DELETE SUPPLIER
// ======================================================

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(
      req.params.id
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("DELETE SUPPLIER ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};