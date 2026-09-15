const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
{
name: {
type: String,
required: true,
trim: true,
},


age: {
  type: Number,
  required: true,
},

gender: {
  type: String,
  required: true,
  enum: ["Male", "Female", "Other"],
},

phone: {
  type: String,
  required: true,
  trim: true,
},

email: {
  type: String,
  lowercase: true,
  trim: true,
  default: "",
},

address: {
  type: String,
  default: "",
},

bloodGroup: {
  type: String,
  default: "",
},

medicalHistory: {
  type: String,
  default: "",
},

emergencyContact: {
  type: String,
  default: "",
},


},
{
timestamps: true,
}
);

module.exports = mongoose.model("Patient", patientSchema);
