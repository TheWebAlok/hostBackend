const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

const getDashboardStats = async (req, res) => {
try {
const [
totalDoctors,
totalPatients,
totalAppointments,
pendingAppointments,
confirmedAppointments,
completedAppointments,
cancelledAppointments,
] = await Promise.all([
Doctor.countDocuments(),
Patient.countDocuments(),
Appointment.countDocuments(),
Appointment.countDocuments({ status: "Pending" }),
Appointment.countDocuments({ status: "Confirmed" }),
Appointment.countDocuments({ status: "Completed" }),
Appointment.countDocuments({ status: "Cancelled" }),
]);


res.status(200).json({
  success: true,
  stats: {
    totalDoctors,
    totalPatients,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
  },
});


} catch (error) {
console.error("DASHBOARD ERROR:", error);


res.status(500).json({
  success: false,
  message: "Error fetching dashboard statistics",
  error: error.message,
});


}
};

module.exports = {
getDashboardStats,
};
