const MedicineOrder = require("../models/MedicineOrder");
const Medicine = require("../models/Medicine");

// =====================================================
// CREATE MEDICINE ORDER
// PUBLIC - PATIENT LOGIN NOT REQUIRED
// =====================================================

exports.createMedicineOrder = async (req, res) => {
  try {
    const {
      patientName,
      patientPhone,
      patientEmail,
      address,
      city,
      pincode,
      items,
      paymentMethod,
      notes,
    } = req.body;

    console.log("=================================");
    console.log("CREATE MEDICINE ORDER");
    console.log("BODY:", req.body);
    console.log("USER:", req.user || "Guest Patient");
    console.log("=================================");

    // =====================================================
    // VALIDATION
    // =====================================================

    if (
      !patientName ||
      !patientPhone ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Patient name, phone and address are required",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one medicine",
      });
    }

    // =====================================================
    // PREPARE ORDER ITEMS
    // =====================================================

    const orderItems = [];

    for (const item of items) {
      if (!item.medicine) {
        return res.status(400).json({
          success: false,
          message: "Medicine ID is required",
        });
      }

      const medicine =
        await Medicine.findById(item.medicine);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message:
            `Medicine not found: ${item.medicine}`,
        });
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${medicine.name}`,
        });
      }

      // =====================================================
      // STOCK
      // =====================================================

      const stock = Number(
        medicine.stock ??
        medicine.quantity ??
        0
      );

      if (stock <= 0) {
        return res.status(400).json({
          success: false,
          message:
            `${medicine.name} is out of stock`,
        });
      }

      if (quantity > stock) {
        return res.status(400).json({
          success: false,
          message:
            `${medicine.name} has only ${stock} units available`,
        });
      }

      // =====================================================
      // PRICE
      // =====================================================

      const price = Number(
        medicine.sellingPrice ??
        medicine.price ??
        0
      );

      if (price < 0) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid price for ${medicine.name}`,
        });
      }

      const total = price * quantity;

      // =====================================================
      // ORDER ITEM
      // =====================================================

      orderItems.push({
        medicine: medicine._id,
        name: medicine.name,

        genericName:
          medicine.genericName ||
          medicine.composition ||
          "",

        quantity,
        price,
        total,
      });
    }

    // =====================================================
    // TOTAL
    // =====================================================

    const totalAmount = orderItems.reduce(
      (sum, item) =>
        sum + Number(item.total || 0),
      0
    );

    // =====================================================
    // CREATE ORDER
    // =====================================================

    const order = await MedicineOrder.create({
      // Guest patient = null
      patient: req.user?.id || null,

      patientName:
        patientName.trim(),

      patientPhone:
        patientPhone.trim(),

      patientEmail:
        patientEmail
          ? patientEmail.trim().toLowerCase()
          : "",

      address:
        address.trim(),

      city:
        city ? city.trim() : "",

      pincode:
        pincode ? pincode.trim() : "",

      items: orderItems,

      totalAmount,

      paymentMethod:
        paymentMethod === "online"
          ? "online"
          : "cash_on_delivery",

      paymentStatus: "pending",

      status: "pending",

      notes:
        notes ? notes.trim() : "",
    });

    console.log(
      "MEDICINE ORDER SAVED:",
      order._id
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(201).json({
      success: true,
      message:
        "Medicine order placed successfully",
      order,
    });

  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "CREATE MEDICINE ORDER ERROR:",
      error
    );

    console.error(
      "ERROR MESSAGE:",
      error.message
    );

    console.error(
      "ERROR NAME:",
      error.name
    );

    console.error(
      "================================="
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to place medicine order",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL MEDICINE ORDERS
// ADMIN / OWNER / PHARMACIST
// =====================================================

exports.getMedicineOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await MedicineOrder.find()
        .populate("items.medicine")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error(
      "GET MEDICINE ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load medicine orders",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ORDER
// =====================================================

exports.getMedicineOrder = async (
  req,
  res
) => {
  try {
    const order =
      await MedicineOrder.findById(
        req.params.id
      ).populate("items.medicine");

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Medicine order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    console.error(
      "GET MEDICINE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load order",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE ORDER STATUS
// ADMIN / OWNER / PHARMACIST
// =====================================================

exports.updateMedicineOrderStatus =
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "pending",
        "accepted",
        "packed",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status",
        });
      }

      const order =
        await MedicineOrder.findByIdAndUpdate(
          req.params.id,
          {
            status,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Medicine order not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Order status updated",
        order,
      });

    } catch (error) {
      console.error(
        "UPDATE MEDICINE ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update order status",
        error: error.message,
      });
    }
  };