const Prescription = require("../models/Prescription");
const Patient = require("../models/Patient");
const Medicine = require("../models/Medicine");

// =====================================================
// ADD PRESCRIPTION
// =====================================================

const addPrescription = async (req, res) => {
  try {
    const {
      patient,
      doctorName,
      vitals,
      chiefComplaints,
      investigations,
      medicines,
      advice,
      date,
    } = req.body;

    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------

    if (!patient || !doctorName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient and doctor name are required",
      });
    }

    // -------------------------------------------------
    // FIND PATIENT
    // -------------------------------------------------

    const patientDoc = await Patient.findById(patient);

    if (!patientDoc) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // -------------------------------------------------
    // CLEAN MEDICINES
    // -------------------------------------------------

    let cleanedMedicines = [];

    if (Array.isArray(medicines)) {
      cleanedMedicines = medicines
        .filter((medicine) => medicine?.name?.trim())
        .map((medicine) => ({
          medicine: medicine.medicine || null,

          name: medicine.name.trim(),

          dosage: medicine.dosage
            ? medicine.dosage.trim()
            : "",

          duration: medicine.duration
            ? medicine.duration.trim()
            : "",

          instructions: medicine.instructions
            ? medicine.instructions.trim()
            : "",
        }));
    }

    // -------------------------------------------------
    // CREATE PRESCRIPTION
    // -------------------------------------------------

    const prescription = await Prescription.create({
      patient: patientDoc._id,

      patientName: patientDoc.name || "",

      patientAge: Number(patientDoc.age) || 0,

      patientGender: patientDoc.gender || "",

      patientAddress: patientDoc.address || "",

      doctorName: doctorName.trim(),

      date: date || Date.now(),

      vitals: vitals?.trim() || "",

      chiefComplaints: Array.isArray(chiefComplaints)
        ? chiefComplaints
            .map((item) => String(item).trim())
            .filter(Boolean)
        : [],

      investigations: Array.isArray(investigations)
        ? investigations
            .map((item) => String(item).trim())
            .filter(Boolean)
        : [],

      medicines: cleanedMedicines,

      advice: advice?.trim() || "",
    });

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    console.error(
      "ADD PRESCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error creating prescription",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL PRESCRIPTIONS FOR PATIENT
// =====================================================

const getPrescriptionsByPatient = async (
  req,
  res
) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const prescriptions =
      await Prescription.find({
        patient: patientId,
      })
        .populate(
          "medicines.medicine",
          "name brand composition batchNumber quantity expiryDate"
        )
        .sort({
          date: -1,
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error(
      "GET PRESCRIPTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error fetching prescription history",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE PRESCRIPTION
// =====================================================

const getPrescriptionById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const prescription =
      await Prescription.findById(id).populate(
        "medicines.medicine",
        "name brand composition batchNumber quantity expiryDate"
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error(
      "GET SINGLE PRESCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error fetching prescription",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE PRESCRIPTION
// =====================================================

const updatePrescription = async (
  req,
  res
) => {
  try {
    const {
      doctorName,
      vitals,
      chiefComplaints,
      investigations,
      medicines,
      advice,
      date,
    } = req.body;

    const prescription =
      await Prescription.findById(
        req.params.id
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // -------------------------------------------------
    // DOCTOR
    // -------------------------------------------------

    if (doctorName !== undefined) {
      if (!doctorName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Doctor name is required",
        });
      }

      prescription.doctorName =
        doctorName.trim();
    }

    // -------------------------------------------------
    // DATE
    // -------------------------------------------------

    if (date !== undefined) {
      prescription.date = date;
    }

    // -------------------------------------------------
    // VITALS
    // -------------------------------------------------

    if (vitals !== undefined) {
      prescription.vitals =
        String(vitals).trim();
    }

    // -------------------------------------------------
    // COMPLAINTS
    // -------------------------------------------------

    if (Array.isArray(chiefComplaints)) {
      prescription.chiefComplaints =
        chiefComplaints
          .map((item) =>
            String(item).trim()
          )
          .filter(Boolean);
    }

    // -------------------------------------------------
    // INVESTIGATIONS
    // -------------------------------------------------

    if (Array.isArray(investigations)) {
      prescription.investigations =
        investigations
          .map((item) =>
            String(item).trim()
          )
          .filter(Boolean);
    }

    // -------------------------------------------------
    // MEDICINES
    // -------------------------------------------------

    if (Array.isArray(medicines)) {
      prescription.medicines =
        medicines
          .filter(
            (medicine) =>
              medicine?.name?.trim()
          )
          .map((medicine) => ({
            medicine:
              medicine.medicine || null,

            name:
              medicine.name.trim(),

            dosage:
              medicine.dosage
                ? medicine.dosage.trim()
                : "",

            duration:
              medicine.duration
                ? medicine.duration.trim()
                : "",

            instructions:
              medicine.instructions
                ? medicine.instructions.trim()
                : "",
          }));
    }

    // -------------------------------------------------
    // ADVICE
    // -------------------------------------------------

    if (advice !== undefined) {
      prescription.advice =
        String(advice).trim();
    }

    await prescription.save();

    const updatedPrescription =
      await Prescription.findById(
        prescription._id
      ).populate(
        "medicines.medicine",
        "name brand composition batchNumber quantity expiryDate"
      );

    return res.status(200).json({
      success: true,
      message:
        "Prescription updated successfully",
      prescription: updatedPrescription,
    });
  } catch (error) {
    console.error(
      "UPDATE PRESCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error updating prescription",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE PRESCRIPTION
// =====================================================

const deletePrescription = async (
  req,
  res
) => {
  try {
    const prescription =
      await Prescription.findByIdAndDelete(
        req.params.id
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Prescription deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE PRESCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error deleting prescription",
      error: error.message,
    });
  }
};

module.exports = {
  addPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};