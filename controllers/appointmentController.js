const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

// ================= CREATE APPOINTMENT (ADMIN / STAFF) =================
const createAppointment = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointmentDate,
      appointmentTime,
      reason,
      symptoms,
    } = req.body;

    // Check Patient
    const patientExists = await Patient.findById(patient);

    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Check Doctor
    const doctorExists = await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check duplicate appointment
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate,
      appointmentTime,
      status: { $ne: "Cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Doctor already has an appointment at this time",
      });
    }

    // Create Appointment
    const appointment = await Appointment.create({
      patient,
      doctor,
      appointmentDate,
      appointmentTime,
      reason,
      symptoms,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name phone email")
      .populate("doctor", "name department specialization");

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("CREATE APPOINTMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error creating appointment",
      error: error.message,
    });
  }
};

// ================= CREATE APPOINTMENT (PUBLIC WEBSITE) =================
// No auth required. Finds an existing patient by email/phone, or creates
// a new one, then books the appointment against that patient.
const createPublicAppointment = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      age,
      gender,
      department,
      appointmentDate,
      appointmentTime,
      doctor,
      message,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    if (!doctor || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date and time are required",
      });
    }

    // Check Doctor
    const doctorExists = await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Find existing patient by phone (and email, if provided), else create one
    const lookupConditions = [{ phone }];

    if (email) {
      lookupConditions.push({ email });
    }

    let patient = await Patient.findOne({ $or: lookupConditions });

    if (!patient) {
      // age/gender are required on the Patient model - needed when
      // creating a brand new patient record from the public form
      if (!age || !gender) {
        return res.status(400).json({
          success: false,
          message: "Age and gender are required for new patients",
        });
      }

      patient = await Patient.create({
        name,
        email: email || "",
        phone,
        age,
        gender,
      });
    }

    // Check duplicate appointment
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate,
      appointmentTime,
      status: { $ne: "Cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Doctor already has an appointment at this time",
      });
    }

    // Create Appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor,
      appointmentDate,
      appointmentTime,
      reason: department || "",
      symptoms: message || "",
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name phone email")
      .populate("doctor", "name department specialization");

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("CREATE PUBLIC APPOINTMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error booking appointment",
      error: error.message,
    });
  }
};

// ================= GET ALL APPOINTMENTS =================
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name phone email")
      .populate("doctor", "name department specialization")
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

// ================= UPDATE APPOINTMENT STATUS =================
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("patient", "name phone email")
      .populate("doctor", "name department specialization");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating appointment",
      error: error.message,
    });
  }
};

// ================= DELETE APPOINTMENT =================
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting appointment",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  createPublicAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
};