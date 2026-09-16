const express = require("express");

const router = express.Router();

const {
  chatWithAI,
  feverAssessment,
} = require("../controllers/aiController");


// =====================================================
// AI CHAT
// =====================================================

router.post(
  "/chat",
  chatWithAI
);


// =====================================================
// FEVER ASSESSMENT
// =====================================================

router.post(
  "/fever-assessment",
  feverAssessment
);


module.exports = router;