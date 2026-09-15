const Pharmacist = require("../models/Pharmacist");

// =====================================================
// CREATE PHARMACIST
// =====================================================

exports.createPharmacist = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existing =
      await Pharmacist.findOne({
        email: normalizedEmail,
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "Pharmacist already exists",
      });
    }

    const pharmacist =
      await Pharmacist.create({
        name,
        email: normalizedEmail,
        password,
        phone,
      });

    return res.status(201).json({
      success: true,
      message:
        "Pharmacist created successfully",

      pharmacist: {
        id: pharmacist._id,
        name: pharmacist.name,
        email: pharmacist.email,
        phone: pharmacist.phone,
        role: pharmacist.role,
      },
    });
  } catch (error) {
    console.error(
      "CREATE PHARMACIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create pharmacist",
      error: error.message,
    });
  }
};