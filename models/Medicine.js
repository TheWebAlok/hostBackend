const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    composition: {
      type: String,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store is required"],
    },

    batchNumber: {
      type: String,
      trim: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      enum: [
        "strip",
        "bottle",
        "box",
        "tablet",
        "capsule",
        "syrup",
        "injection",
        "other",
      ],
      default: "strip",
    },

    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: 0,
    },

    mrp: {
      type: Number,
      min: 0,
    },

    manufactureDate: {
      type: Date,
    },

    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    requiresPrescription: {
      type: Boolean,
      default: false,
    },

    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ======================================================
// VIRTUAL: EXPIRED
// ======================================================

medicineSchema.virtual("isExpired").get(function () {
  return this.expiryDate < new Date();
});

// ======================================================
// VIRTUAL: LOW STOCK
// ======================================================

medicineSchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.lowStockThreshold;
});

// ======================================================
// JSON / OBJECT VIRTUALS
// ======================================================

medicineSchema.set("toJSON", {
  virtuals: true,
});

medicineSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("Medicine", medicineSchema);
