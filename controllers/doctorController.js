const Doctor = require("../models/Doctor.js");
const { deletePhotoFile } = require("../middleware/Upload.js");

// =====================================================
// ADD DOCTOR - ADMIN ONLY
// =====================================================

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      department,
      specialization,
      experience,
      availableDays,
      availableTime,
      bio,
      linkedin,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !department ||
      !specialization
    ) {
      // if a photo was uploaded but validation fails, clean it up
      if (req.file) deletePhotoFile(`/uploads/doctors/${req.file.filename}`);

      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const existingDoctor = await Doctor.findOne({
      email: email.toLowerCase(),
    });

    if (existingDoctor) {
      if (req.file) deletePhotoFile(`/uploads/doctors/${req.file.filename}`);

      return res.status(400).json({
        success: false,
        message: "Doctor already exists with this email",
      });
    }

    // availableDays can arrive as a real array (JSON) or a comma string (multipart form)
    let parsedDays = [];

    if (Array.isArray(availableDays)) {
      parsedDays = availableDays;
    } else if (typeof availableDays === "string" && availableDays.length) {
      try {
        parsedDays = JSON.parse(availableDays);
      } catch {
        parsedDays = availableDays.split(",").map((d) => d.trim()).filter(Boolean);
      }
    }

    const doctor = await Doctor.create({
      name,
      email,
      password,
      phone,
      department,
      specialization,
      experience: Number(experience) || 0,
      availableDays: parsedDays,
      availableTime: availableTime || "",
      bio: bio || "",
      linkedin: linkedin || "",
      photo: req.file ? `/uploads/doctors/${req.file.filename}` : "",
    });

    const doctorResponse = doctor.toObject();

    delete doctorResponse.password;

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      doctor: doctorResponse,
    });
  } catch (error) {
    console.error("ADD DOCTOR ERROR:", error);

    if (req.file) deletePhotoFile(`/uploads/doctors/${req.file.filename}`);

    res.status(500).json({
      success: false,
      message: "Error adding doctor",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL DOCTORS - ADMIN ONLY
// =====================================================

const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("GET DOCTORS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching doctors",
      error: error.message,
    });
  }
};

// =====================================================
// GET PUBLIC DOCTORS LIST - NO AUTH
// Used by the public "Our Doctors" page
// =====================================================

const getPublicDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select(
        "name email phone department specialization experience availableDays availableTime photo bio linkedin"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("GET PUBLIC DOCTORS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching doctors",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE DOCTOR - ADMIN ONLY
// =====================================================

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching doctor",
      error: error.message,
    });
  }
};

// =====================================================
// GET LOGGED-IN DOCTOR PROFILE
// =====================================================

const getMyProfile = async (req, res) => {
  try {
    const doctorId =
      req.user?.doctorId || req.user?.id || req.user?._id || req.user?.userId;

    if (!doctorId) {
      return res.status(401).json({
        success: false,
        message: "Doctor ID not found in token",
      });
    }

    const doctor = await Doctor.findById(doctorId).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("GET MY PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching doctor profile",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE DOCTOR - ADMIN
// =====================================================

const updateDoctor = async (req, res) => {
  try {
    console.log("=== UPDATE DOCTOR DEBUG ===");
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    console.log("===========================");

    const updates = { ...req.body };

    if (!updates.password) {
      delete updates.password;
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    if (updates.experience !== undefined) {
      updates.experience = Number(updates.experience);
    }

    if (updates.availableDays !== undefined) {
      if (Array.isArray(updates.availableDays)) {
        // already an array, keep as-is
      } else if (typeof updates.availableDays === "string") {
        try {
          updates.availableDays = JSON.parse(updates.availableDays);
        } catch {
          updates.availableDays = updates.availableDays
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean);
        }
      }
    }

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      if (req.file) deletePhotoFile(`/uploads/doctors/${req.file.filename}`);

      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check email duplication
    if (updates.email && updates.email !== doctor.email) {
      const existingDoctor = await Doctor.findOne({
        email: updates.email,
        _id: { $ne: doctor._id },
      });

      if (existingDoctor) {
        if (req.file) deletePhotoFile(`/uploads/doctors/${req.file.filename}`);

        return res.status(400).json({
          success: false,
          message: "Another doctor already uses this email",
        });
      }
    }

    // New photo uploaded -> replace old one on disk
    if (req.file) {
      const oldPhoto = doctor.photo;

      updates.photo = `/uploads/doctors/${req.file.filename}`;

      if (oldPhoto) deletePhotoFile(oldPhoto);
    }

    Object.assign(doctor, updates);

    await doctor.save();

    const doctorResponse = doctor.toObject();

    delete doctorResponse.password;

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor: doctorResponse,
    });
  } catch (error) {
    console.error("UPDATE DOCTOR ERROR:", error);

    if (req.file) deletePhotoFile(`/uploads/doctors/${req.file.filename}`);

    res.status(500).json({
      success: false,
      message: "Error updating doctor",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE MY PROFILE - DOCTOR
// =====================================================

const updateMyProfile = async (req, res) => {
  try {
    const doctorId =
      req.user?.doctorId || req.user?.id || req.user?._id || req.user?.userId;

    if (!doctorId) {
      return res.status(401).json({
        success: false,
        message: "Doctor ID not found in token",
      });
    }

    const updates = { ...req.body };

    if (!updates.password) {
      delete updates.password;
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    if (updates.experience !== undefined) {
      updates.experience = Number(updates.experience);
    }

    // availableDays can arrive as a real array or a JSON/comma string
    // (this was previously missing here, even though updateDoctor had it —
    // it's needed because the doctor's own edit form sends it as a
    // JSON.stringify'd array via FormData)
    if (updates.availableDays !== undefined) {
      if (Array.isArray(updates.availableDays)) {
        // already an array, keep as-is
      } else if (typeof updates.availableDays === "string") {
        try {
          updates.availableDays = JSON.parse(updates.availableDays);
        } catch {
          updates.availableDays = updates.availableDays
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean);
        }
      }
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      if (req.file) deletePhotoFile(`/uploads/doctors/${req.file.filename}`);

      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    if (updates.email && updates.email !== doctor.email) {
      const existingDoctor = await Doctor.findOne({
        email: updates.email,
        _id: { $ne: doctor._id },
      });

      if (existingDoctor) {
        if (req.file) deletePhotoFile(`/uploads/doctors/${req.file.filename}`);

        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    if (req.file) {
      const oldPhoto = doctor.photo;

      updates.photo = `/uploads/doctors/${req.file.filename}`;

      if (oldPhoto) deletePhotoFile(oldPhoto);
    }

    Object.assign(doctor, updates);

    await doctor.save();

    const doctorResponse = doctor.toObject();

    delete doctorResponse.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      doctor: doctorResponse,
    });
  } catch (error) {
    console.error("UPDATE MY PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE DOCTOR - ADMIN
// =====================================================

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.photo) deletePhotoFile(doctor.photo);

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("DELETE DOCTOR ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error deleting doctor",
      error: error.message,
    });
  }
};

module.exports = {
  addDoctor,
  getDoctors,
  getPublicDoctors,
  getDoctorById,
  getMyProfile,
  updateDoctor,
  updateMyProfile,
  deleteDoctor,
};