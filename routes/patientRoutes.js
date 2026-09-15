const express = require("express");

const {
addPatient,
getPatients,
getPatientById,
updatePatient,
deletePatient,
} = require("../controllers/patientController.js");

const { protect } = require("../middleware/authMiddleware.js");
const router = express.Router();

router.post("/", protect, addPatient);
router.get("/", protect, getPatients);
router.get("/:id", protect, getPatientById);
router.put("/:id", protect, updatePatient);
router.delete("/:id", protect, deletePatient);

module.exports = router;
