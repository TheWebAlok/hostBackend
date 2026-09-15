const Medicine = require("../models/Medicine");

// ======================================================
// CREATE MEDICINE
// ======================================================

// @desc    Add new medicine
// @route   POST /api/medicines
// @access  Private

exports.createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create({
      name: req.body.name,

      // Frontend -> Backend
      brand: req.body.manufacturer || req.body.brand || "",
      composition: req.body.genericName || req.body.composition || "",

      category: req.body.category || null,
      supplier: req.body.supplier || null,
      store: req.body.store,

      batchNumber: req.body.batchNumber || "",

      // Frontend uses "stock"
      quantity:
        req.body.stock !== undefined
          ? Number(req.body.stock)
          : Number(req.body.quantity || 0),

      unit: req.body.unit || "strip",

      purchasePrice: Number(req.body.purchasePrice),
      sellingPrice: Number(req.body.sellingPrice),

      mrp:
        req.body.mrp !== undefined && req.body.mrp !== ""
          ? Number(req.body.mrp)
          : undefined,

      manufactureDate:
        req.body.manufactureDate || undefined,

      expiryDate: req.body.expiryDate,

      requiresPrescription:
        req.body.requiresPrescription || false,

      lowStockThreshold:
        req.body.lowStockAlert !== undefined
          ? Number(req.body.lowStockAlert)
          : Number(req.body.lowStockThreshold || 10),

      isActive:
        req.body.isActive !== undefined
          ? req.body.isActive
          : true,
    });

    return res.status(201).json({
      success: true,
      message: "Medicine created successfully",
      data: medicine,
    });
  } catch (error) {
    console.error("CREATE MEDICINE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET ALL MEDICINES
// ======================================================

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private

exports.getMedicines = async (req, res) => {
  try {
    const {
      search,
      category,
      store,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: search,
            $options: "i",
          },
        },
        {
          composition: {
            $regex: search,
            $options: "i",
          },
        },
        {
          batchNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (store) {
      query.store = store;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const medicines = await Medicine.find(query)
      .populate("category", "name")
      .populate("supplier", "name companyName")
      .populate("store", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({
        createdAt: -1,
      });

    const total = await Medicine.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: medicines.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: medicines,
    });
  } catch (error) {
    console.error("GET MEDICINES ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET SINGLE MEDICINE
// ======================================================

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private

exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate("category", "name")
      .populate("supplier", "name companyName")
      .populate("store", "name");

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    console.error("GET MEDICINE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// UPDATE MEDICINE
// ======================================================

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private

exports.updateMedicine = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name !== undefined) {
      updateData.name = req.body.name;
    }

    if (req.body.manufacturer !== undefined) {
      updateData.brand = req.body.manufacturer;
    } else if (req.body.brand !== undefined) {
      updateData.brand = req.body.brand;
    }

    if (req.body.genericName !== undefined) {
      updateData.composition = req.body.genericName;
    } else if (req.body.composition !== undefined) {
      updateData.composition = req.body.composition;
    }

    if (req.body.category !== undefined) {
      updateData.category = req.body.category;
    }

    if (req.body.supplier !== undefined) {
      updateData.supplier = req.body.supplier;
    }

    if (req.body.store !== undefined) {
      updateData.store = req.body.store;
    }

    if (req.body.batchNumber !== undefined) {
      updateData.batchNumber = req.body.batchNumber;
    }

    if (req.body.stock !== undefined) {
      updateData.quantity = Number(req.body.stock);
    } else if (req.body.quantity !== undefined) {
      updateData.quantity = Number(req.body.quantity);
    }

    if (req.body.unit !== undefined) {
      updateData.unit = req.body.unit;
    }

    if (req.body.purchasePrice !== undefined) {
      updateData.purchasePrice = Number(req.body.purchasePrice);
    }

    if (req.body.sellingPrice !== undefined) {
      updateData.sellingPrice = Number(req.body.sellingPrice);
    }

    if (req.body.mrp !== undefined && req.body.mrp !== "") {
      updateData.mrp = Number(req.body.mrp);
    }

    if (req.body.manufactureDate !== undefined) {
      updateData.manufactureDate = req.body.manufactureDate;
    }

    if (req.body.expiryDate !== undefined) {
      updateData.expiryDate = req.body.expiryDate;
    }

    if (req.body.requiresPrescription !== undefined) {
      updateData.requiresPrescription =
        req.body.requiresPrescription;
    }

    if (req.body.lowStockAlert !== undefined) {
      updateData.lowStockThreshold =
        Number(req.body.lowStockAlert);
    } else if (req.body.lowStockThreshold !== undefined) {
      updateData.lowStockThreshold =
        Number(req.body.lowStockThreshold);
    }

    if (req.body.isActive !== undefined) {
      updateData.isActive = req.body.isActive;
    }

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: medicine,
    });
  } catch (error) {
    console.error("UPDATE MEDICINE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// DELETE MEDICINE
// ======================================================

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private

exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(
      req.params.id
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("DELETE MEDICINE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// LOW STOCK MEDICINES
// ======================================================

// @desc    Get low stock medicines
// @route   GET /api/medicines/alerts/low-stock
// @access  Private

exports.getLowStockMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      $expr: {
        $lte: [
          "$quantity",
          "$lowStockThreshold",
        ],
      },
    })
      .populate("category", "name")
      .populate("store", "name")
      .sort({
        quantity: 1,
      });

    return res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    console.error("LOW STOCK ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// EXPIRING MEDICINES
// ======================================================

// @desc    Get expired / soon-to-expire medicines
// @route   GET /api/medicines/alerts/expiring?days=30
// @access  Private

exports.getExpiringMedicines = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;

    const futureDate = new Date();

    futureDate.setDate(
      futureDate.getDate() + days
    );

    const medicines = await Medicine.find({
      expiryDate: {
        $lte: futureDate,
      },
    })
      .populate("category", "name")
      .populate("store", "name")
      .sort({
        expiryDate: 1,
      });

    return res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    console.error("EXPIRING MEDICINES ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};