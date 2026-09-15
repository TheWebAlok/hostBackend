const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    // Store Name
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },

    // Store Code
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      uppercase: true,
    },

    // Phone
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    // Email
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Address
    address: {
      type: String,
      trim: true,
    },

    // City
    city: {
      type: String,
      trim: true,
    },

    // State
    state: {
      type: String,
      trim: true,
    },

    // Pincode
    pincode: {
      type: String,
      trim: true,
    },

    // Manager Name
    managerName: {
      type: String,
      trim: true,
    },

    // Store Status
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // Store Owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Store", storeSchema);