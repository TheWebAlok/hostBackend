const mongoose = require("mongoose");

// =====================================================
// PRESCRIPTION MEDICINE
// =====================================================

const medicineSchema = new mongoose.Schema(
  {
    // Pharmacy inventory medicine ID
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null,
    },

    // Snapshot of medicine name
    // So history remains readable even if pharmacy medicine changes
    name: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: String,
      default: "",
      trim: true,
    },

    instructions: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

// =====================================================
// PRESCRIPTION
// =====================================================

const prescriptionSchema = new mongoose.Schema(
  {
    // =================================================
    // PATIENT
    // =================================================

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // Patient snapshot
    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    patientAge: {
      type: Number,
      required: true,
    },

    patientGender: {
      type: String,
      required: true,
      trim: true,
    },

    patientAddress: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // DOCTOR / VISIT
    // =================================================

    doctorName: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    vitals: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // COMPLAINTS
    // =================================================

    chiefComplaints: {
      type: [String],
      default: [],
    },

    // =================================================
    // INVESTIGATIONS
    // =================================================

    investigations: {
      type: [String],
      default: [],
    },

    // =================================================
    // MEDICINES
    // =================================================

    medicines: {
      type: [medicineSchema],
      default: [],
    },

    // =================================================
    // ADVICE
    // =================================================

    advice: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Prescription",
  prescriptionSchema
);