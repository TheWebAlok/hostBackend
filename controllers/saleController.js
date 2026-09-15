const mongoose = require("mongoose");

const Sale = require("../models/Sale");
const Medicine = require("../models/Medicine");
const Store = require("../models/Store");
const Admin = require("../models/Admin");

// =====================================================
// CREATE SALE
// POST /api/sales
// =====================================================
exports.createSale = async (req, res) => {
  try {
    const {
      store,
      customerName,
      customerPhone,
      items,
      paymentMethod,
    } = req.body;

    // -----------------------------------------------
    // Validate store
    // -----------------------------------------------
    if (!store) {
      return res.status(400).json({
        success: false,
        message: "Store is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(store)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const storeExists = await Store.findById(store);

    if (!storeExists) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // -----------------------------------------------
    // Validate items
    // -----------------------------------------------
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Sale must include at least one item",
      });
    }

    // -----------------------------------------------
    // Validate logged-in admin
    // -----------------------------------------------
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User information not found in token",
      });
    }

    // Make sure Admin exists
    const adminExists = await Admin.findById(req.user._id);

    if (!adminExists) {
      return res.status(401).json({
        success: false,
        message: "Logged-in admin not found",
      });
    }

    let totalAmount = 0;
    const saleItems = [];

    // =================================================
    // PROCESS EACH MEDICINE
    // =================================================
    for (const item of items) {
      if (!item.medicine) {
        return res.status(400).json({
          success: false,
          message: "Medicine is required for every item",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(item.medicine)) {
        return res.status(400).json({
          success: false,
          message: "Invalid medicine ID",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
      }

      // -----------------------------------------------
      // Find medicine
      // -----------------------------------------------
      const medicine = await Medicine.findById(item.medicine);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine ${item.medicine} not found`,
        });
      }

      // -----------------------------------------------
      // Check active medicine
      // -----------------------------------------------
      if (medicine.isActive === false) {
        return res.status(400).json({
          success: false,
          message: `${medicine.name} is inactive`,
        });
      }

      // -----------------------------------------------
      // Check stock
      // -----------------------------------------------
      if (medicine.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}`,
        });
      }

      // -----------------------------------------------
      // Selling price
      // -----------------------------------------------
      let price;

      if (
        item.price !== undefined &&
        item.price !== null &&
        item.price !== ""
      ) {
        price = Number(item.price);
      } else {
        price = Number(medicine.sellingPrice);
      }

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${medicine.name}`,
        });
      }

      // -----------------------------------------------
      // Calculate item total
      // -----------------------------------------------
      const itemTotal = price * quantity;

      totalAmount += itemTotal;

      // -----------------------------------------------
      // Add sale item
      // -----------------------------------------------
      saleItems.push({
        medicine: medicine._id,
        quantity,
        price,
      });

      // -----------------------------------------------
      // Deduct stock
      // -----------------------------------------------
      medicine.quantity -= quantity;

      await medicine.save();
    }

    // =================================================
    // CREATE SALE
    // =================================================
    const sale = await Sale.create({
      store,
      soldBy: req.user._id,
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      items: saleItems,
      totalAmount,
      paymentMethod: paymentMethod || "cash",
    });

    // Populate response
    const populatedSale = await Sale.findById(sale._id)
      .populate("items.medicine", "name sellingPrice quantity")
      .populate("soldBy", "name email")
      .populate("store", "name code");

    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: populatedSale,
    });
  } catch (error) {
    console.error("CREATE SALE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL SALES
// GET /api/sales
// =====================================================
exports.getSales = async (req, res) => {
  try {
    const query = {};

    // Optional store filter
    if (req.query.store) {
      if (!mongoose.Types.ObjectId.isValid(req.query.store)) {
        return res.status(400).json({
          success: false,
          message: "Invalid store ID",
        });
      }

      query.store = req.query.store;
    }

    const sales = await Sale.find(query)
      .populate("items.medicine", "name brand sellingPrice")
      .populate("soldBy", "name email")
      .populate("store", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    console.error("GET SALES ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE SALE
// GET /api/sales/:id
// =====================================================
exports.getSale = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sale ID",
      });
    }

    const sale = await Sale.findById(id)
      .populate("items.medicine", "name brand sellingPrice quantity")
      .populate("soldBy", "name email")
      .populate("store", "name code");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error("GET SALE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};