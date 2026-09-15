const express = require("express");

const {
  createPharmacist,
} = require("../controllers/pharmacistController");

const router = express.Router();

router.post("/", createPharmacist);

module.exports = router;