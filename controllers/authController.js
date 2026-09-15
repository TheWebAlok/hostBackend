const Admin = require("../models/Admin.js");
const Doctor = require("../models/Doctor.js");
const Pharmacist = require("../models/Pharmacist.js");
const jwt = require("jsonwebtoken");


// =====================================================
// REGISTER ADMIN
// =====================================================

const registerAdmin = async (req, res) => {
  try {

    const {
      name,
      email,
      password
    } = req.body;


    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }


    const normalizedEmail =
      email.toLowerCase().trim();


    // Check existing admin

    const existingAdmin =
      await Admin.findOne({
        email: normalizedEmail,
      });


    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }


    // Check if doctor already uses email

    const existingDoctor =
      await Doctor.findOne({
        email: normalizedEmail,
      });


    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "This email is already used by a doctor",
      });
    }


    // Create admin

    const admin = await Admin.create({
      name,
      email: normalizedEmail,
      password,
    });


    res.status(201).json({

      success: true,

      message: "Admin registered successfully",

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },

    });


  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );


    res.status(500).json({

      success: false,

      message: "Registration failed",

      error: error.message,

    });

  }
};



// =====================================================
// BUILD JWT RESPONSE
// =====================================================

// =====================================================
// BUILD JWT RESPONSE
// =====================================================

const buildAuthResponse = (res, user, role) => {
  const token = jwt.sign(
    {
      id: user._id,
      role: role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  let message = "Login successful";

  if (role === "admin") {
    message = "Admin login successful";
  } else if (role === "doctor") {
    message = "Doctor login successful";
  } else if (role === "pharmacist") {
    message = "Pharmacist login successful";
  }

  res.status(200).json({
    success: true,
    message,

    token,

    role,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role,

      ...(role === "doctor" && {
        department: user.department,
        specialization: user.specialization,
      }),

      ...(role === "pharmacist" && {
        phone: user.phone,
      }),
    },
  });
};


// =====================================================
// LOGIN - ADMIN OR DOCTOR
// =====================================================

// =====================================================
// LOGIN - ADMIN / DOCTOR / PHARMACIST
// =====================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // =================================================
    // 1. CHECK ADMIN
    // =================================================

    const admin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (admin) {
      const isMatch =
        await admin.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      return buildAuthResponse(
        res,
        admin,
        "admin"
      );
    }

    // =================================================
    // 2. CHECK DOCTOR
    // =================================================

    const doctor = await Doctor.findOne({
      email: normalizedEmail,
    });

    if (doctor) {
      const isMatch =
        await doctor.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      return buildAuthResponse(
        res,
        doctor,
        "doctor"
      );
    }

    // =================================================
    // 3. CHECK PHARMACIST
    // =================================================

    const pharmacist =
      await Pharmacist.findOne({
        email: normalizedEmail,
      });

    if (pharmacist) {
      const isMatch =
        await pharmacist.comparePassword(
          password
        );

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      return buildAuthResponse(
        res,
        pharmacist,
        "pharmacist"
      );
    }

    // =================================================
    // 4. USER NOT FOUND
    // =================================================

    return res.status(401).json({
      success: false,
      message:
        "Invalid email or password",
    });

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};


module.exports = {
  registerAdmin,
  login,
};