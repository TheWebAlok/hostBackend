const Patient = require("../models/Patient");

// ================= ADD PATIENT =================
const addPatient = async (req, res) => {
try {
const {
name,
age,
gender,
phone,
email,
address,
bloodGroup,
medicalHistory,
emergencyContact,
} = req.body;


const patient = await Patient.create({
  name,
  age,
  gender,
  phone,
  email,
  address,
  bloodGroup,
  medicalHistory,
  emergencyContact,
});

res.status(201).json({
  success: true,
  message: "Patient added successfully",
  patient,
});


} catch (error) {
console.error("ADD PATIENT ERROR:", error);


res.status(500).json({
  success: false,
  message: "Error adding patient",
  error: error.message,
});


}
};

// ================= GET ALL PATIENTS =================
const getPatients = async (req, res) => {
try {
const patients = await Patient.find().sort({ createdAt: -1 });


res.status(200).json({
  success: true,
  count: patients.length,
  patients,
});


} catch (error) {
res.status(500).json({
success: false,
message: "Error fetching patients",
error: error.message,
});
}
};

// ================= GET SINGLE PATIENT =================
const getPatientById = async (req, res) => {
try {
const patient = await Patient.findById(req.params.id);


if (!patient) {
  return res.status(404).json({
    success: false,
    message: "Patient not found",
  });
}

res.status(200).json({
  success: true,
  patient,
});


} catch (error) {
res.status(500).json({
success: false,
message: "Error fetching patient",
error: error.message,
});
}
};

// ================= UPDATE PATIENT =================
const updatePatient = async (req, res) => {
try {
const patient = await Patient.findByIdAndUpdate(
req.params.id,
req.body,
{
new: true,
runValidators: true,
}
);


if (!patient) {
  return res.status(404).json({
    success: false,
    message: "Patient not found",
  });
}

res.status(200).json({
  success: true,
  message: "Patient updated successfully",
  patient,
});


} catch (error) {
res.status(500).json({
success: false,
message: "Error updating patient",
error: error.message,
});
}
};

// ================= DELETE PATIENT =================
const deletePatient = async (req, res) => {
try {
const patient = await Patient.findByIdAndDelete(req.params.id);


if (!patient) {
  return res.status(404).json({
    success: false,
    message: "Patient not found",
  });
}

res.status(200).json({
  success: true,
  message: "Patient deleted successfully",
});


} catch (error) {
res.status(500).json({
success: false,
message: "Error deleting patient",
error: error.message,
});
}
};

module.exports = {
addPatient,
getPatients,
getPatientById,
updatePatient,
deletePatient,
};
