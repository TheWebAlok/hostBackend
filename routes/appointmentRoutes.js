const express = require("express");

const {
  createAppointment,
  createPublicAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} = require("../controllers/appointmentController.js");

const { protect } = require("../middleware/authMiddleware.js");
const router = express.Router();

// Public Booking (no auth) - must come before any conflicting routes
router.post("/public", createPublicAppointment);

// Create Appointment (admin/staff)
router.post("/", protect, createAppointment);

// Get All Appointments
router.get("/",  getAppointments);

// Update Appointment Status
router.put("/:id/status", protect, updateAppointmentStatus);

// Delete Appointment
router.delete("/:id", protect, deleteAppointment);

module.exports = router;