const mongoose = require("mongoose");

// ===============================
// SALE ITEM SCHEMA
// ===============================
const saleItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: [true, "Medicine is required"],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
  },
  {
    _id: false,
  }
);

// ===============================
// SALE SCHEMA
// ===============================
const saleSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store is required"],
    },

    // Your project uses Admin model, not User model
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Sold by is required"],
    },

    customerName: {
      type: String,
      trim: true,
    },

    customerPhone: {
      type: String,
      trim: true,
    },

    items: {
      type: [saleItemSchema],
      required: [true, "Sale items are required"],

      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Sale must contain at least one item",
      },
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "other"],
      default: "cash",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sale", saleSchema);