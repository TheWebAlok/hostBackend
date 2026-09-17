const groq = require("../config/groq");
const Doctor = require("../models/Doctor");
const Medicine = require("../models/Medicine");
const { detectDepartmentHints } = require("./departmentHints"); // <-- adjust path to wherever file 2 lives

// =====================================================
// HOSPITAL SERVICES
// =====================================================

const hospitalServices = `
Our hospital provides a wide range of healthcare services, including:

- 🏥 **Outpatient (OPD) consultations**
- 👨‍⚕️ **General physician consultations**
- 🩺 **Specialist doctor consultations**
- 🚑 **Emergency and trauma care**
- 📅 **Online and in-person appointment booking**
- 🧪 **Laboratory and diagnostic services**
- 🩸 **Blood tests and pathology services**
- 🩻 **X-Ray and radiology services**
- 🖥️ **Ultrasound and medical imaging**
- ❤️ **ECG and cardiac diagnostic services**
- 🫀 **Cardiology and heart care**
- 🦴 **Orthopedic and bone care**
- 🧠 **Neurology services**
- 👁️ **Eye care and ophthalmology**
- 👂 **ENT services**
- 🦷 **Dental care**
- 👩‍⚕️ **Gynecology and women's healthcare**
- 🤰 **Obstetrics and maternity services**
- 👶 **Pediatric and child healthcare**
- 🧑‍⚕️ **General surgery**
- 🩹 **Minor and major surgical procedures**
- 🏥 **Operation theatre and surgical services**
- 💉 **Anesthesia services**
- 🩺 **ICU and critical care**
- 🛏️ **Inpatient and hospital admission services**
- 💊 **Pharmacy and medicine services**
- 📋 **Digital prescriptions and medical records**
- 💻 **Video consultation**
- 🧑‍⚕️ **Preventive health check-ups**
- 🩸 **Blood bank and transfusion services**
- 🚑 **Ambulance services**
- 🧑‍⚕️ **Physiotherapy and rehabilitation**
`;

// =====================================================
// SERVICE QUESTION DETECTION
// =====================================================

const isHospitalServicesQuestion = (message) => {
  const text = message.toLowerCase().trim();

  const keywords = [
    "what services",
    "which services",
    "hospital services",
    "services does the hospital",
    "services provided",
    "services available",
    "hospital provide",
    "hospital provides",
    "what does the hospital provide",
    "hospital facilities",
    "hospital facility",
    "what facilities",
    "medical services",
    "healthcare services",
    "health care services",
  ];

  return keywords.some((keyword) => text.includes(keyword));
};

// =====================================================
// FEVER MEDICINE QUESTION DETECTION
// =====================================================

const isFeverMedicineQuestion = (message) => {
  const text = message.toLowerCase().trim();

  const feverWords = ["fever", "bukhar", "temperature", "high temperature"];

  const medicineWords = [
    "medicine",
    "medication",
    "tablet",
    "drug",
    "dawa",
    "दवा",
    "मेडिसिन",
    "medicine batao",
    "dawa batao",
    "medicine chahiye",
  ];

  const hasFever = feverWords.some((word) => text.includes(word));
  const wantsMedicine = medicineWords.some((word) => text.includes(word));

  return hasFever && wantsMedicine;
};

// =====================================================
// GENERAL HEALTH / SYMPTOM / DIET GUIDANCE DETECTION
// =====================================================
// Catches questions like:
//   "mujhe bukhar hai, kya khana chahiye?"
//   "I have kidney problems, what should I eat and avoid?"
//   "mujhe sugar hai, subah nashte me kya khaun?"
//   "મને તાવ છે, શું ખાવું?"
// i.e. symptom/condition words combined with a "what should I
// do / eat / avoid / take care of" style guidance-seeking phrase.
// This is intentionally broader than the fever-medicine detector
// (which only fires for explicit medicine requests), and is
// checked BEFORE the department-hint fast path so guidance
// questions don't get short-circuited into a plain doctor list.
// =====================================================

const isHealthGuidanceQuestion = (message) => {
  const text = message.toLowerCase().trim();

  const symptomOrConditionWords = [
    // symptoms
    "fever",
    "bukhar",
    "बुखार",
    "cold",
    "cough",
    "khansi",
    "खांसी",
    "headache",
    "sir dard",
    "सिर दर्द",
    "vomit",
    "ulti",
    "उल्टी",
    "loose motion",
    "diarrhea",
    "pain",
    "dard",
    "दर्द",
    "weakness",
    "kamzori",
    "कमजोरी",
    "acidity",
    "gas",
    "constipation",
    "kabj",
    "कब्ज",
    // chronic conditions
    "kidney",
    "किडनी",
    "diabetes",
    "sugar",
    "शुगर",
    "blood pressure",
    "bp",
    "बीपी",
    "pressure",
    "cholesterol",
    "कोलेस्ट्रॉल",
    "thyroid",
    "थायराइड",
    "liver",
    "लिवर",
    "heart",
    "हार्ट",
    "asthma",
    "pregnant",
    "pregnancy",
    "गर्भवती",
    "anemia",
    "khoon ki kami",
    "uric acid",
  ];

  const guidanceWords = [
    "kya khaun",
    "kya khana",
    "क्या खाऊं",
    "क्या खाना",
    "khana chahiye",
    "खाना चाहिए",
    "avoid",
    "parhej",
    "परहेज",
    "diet",
    "food",
    "khana",
    "खाना",
    "nashta",
    "नाश्ता",
    "kya karu",
    "क्या करूं",
    "what should i eat",
    "what should i do",
    "what to eat",
    "what to avoid",
    "care",
    "dekhbhal",
    "देखभाल",
    "precaution",
    "सावधानी",
    "khaun",
    "kya na khaun",
    "kya nahi khana",
    "क्या न खाऊं",
    "शું ખાવું", // gujarati: what to eat
    "શું ખાવું",
  ];

  const hasSymptomOrCondition = symptomOrConditionWords.some((word) =>
    text.includes(word)
  );
  const wantsGuidance = guidanceWords.some((word) => text.includes(word));

  return hasSymptomOrCondition && wantsGuidance;
};

// =====================================================
// GET SUITABLE DOCTOR
// =====================================================

const getSuitableDoctor = async () => {
  // 1. First preference: General Medicine
  let doctor = await Doctor.findOne({
    $or: [
      { department: { $regex: /^General Medicine$/i } },
      { specialization: { $regex: /^General Medicine$/i } },
      { department: { $regex: /General/i } },
    ],
  }).select(
    "name department specialization experience availableDays availableTime photo bio"
  );

  // 2. Second preference: General Physician
  if (!doctor) {
    doctor = await Doctor.findOne({
      $or: [
        { specialization: { $regex: /General Physician/i } },
        { department: { $regex: /Physician/i } },
      ],
    }).select(
      "name department specialization experience availableDays availableTime photo bio"
    );
  }

  // 3. Third preference: MBBS ONLY if department is NOT Pathology
  if (!doctor) {
    doctor = await Doctor.findOne({
      specialization: { $regex: /^MBBS$/i },
      department: { $not: /Pathology/i },
    }).select(
      "name department specialization experience availableDays availableTime photo bio"
    );
  }

  return doctor;
};

// =====================================================
// HELPER: FIND DOCTORS MATCHING A DEPARTMENT / SPECIALIZATION NAME
// =====================================================

const findDoctorsByName = async (name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return Doctor.find({
    $or: [
      { specialization: { $regex: escaped, $options: "i" } },
      { department: { $regex: escaped, $options: "i" } },
    ],
  })
    .select(
      "name department specialization experience availableDays availableTime photo bio linkedin phone"
    )
    .sort({ experience: -1 })
    .lean();
};

// =====================================================
// MAIN CHAT CONTROLLER
// =====================================================

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const userMessage = message.trim();

    console.log("AI User Question:", userMessage);

    // =====================================================
    // 1. HOSPITAL SERVICES
    // =====================================================

    if (isHospitalServicesQuestion(userMessage)) {
      return res.status(200).json({
        success: true,
        type: "HOSPITAL_SERVICES",
        reply: hospitalServices,
        specialization: null,
        doctors: [],
        form: null,
      });
    }

    // =====================================================
    // 2. FEVER MEDICINE QUESTION
    // =====================================================

    if (isFeverMedicineQuestion(userMessage)) {
      return res.status(200).json({
        success: true,
        type: "FEVER_ASSESSMENT",
        reply:
          "Before giving medication guidance, please provide a few details about your fever. After you submit the form, we will help you connect with a suitable doctor for proper evaluation.",
        specialization: "General Medicine",
        doctors: [],
        form: {
          type: "fever",
          fields: [
            { name: "age", label: "Age", type: "number", required: true },
            {
              name: "duration",
              label: "How many days have you had fever?",
              type: "number",
              required: true,
            },
            {
              name: "temperature",
              label: "Current temperature (°F)",
              type: "number",
              required: true,
            },
            {
              name: "previousMedicine",
              label: "Have you taken any medicine already?",
              type: "select",
              options: ["Yes", "No"],
              required: true,
            },
            {
              name: "medicineName",
              label: "If yes, which medicine?",
              type: "text",
              required: false,
            },
            {
              name: "symptoms",
              label: "Other symptoms",
              type: "textarea",
              required: false,
            },
            {
              name: "allergies",
              label: "Any medicine allergy?",
              type: "text",
              required: false,
            },
            {
              name: "medicalConditions",
              label: "Any existing medical condition?",
              type: "textarea",
              required: false,
            },
          ],
        },
      });
    }

    // =====================================================
    // 3. GENERAL HEALTH / SYMPTOM / DIET GUIDANCE
    // (multilingual, non-diagnostic, safety-first)
    // =====================================================

    if (isHealthGuidanceQuestion(userMessage)) {
      const guidanceCompletion = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: `
You are a hospital AI health-guidance assistant.

CRITICAL LANGUAGE RULE:
- Detect the language/script the patient used (Hindi, English,
  Hinglish, Gujarati, or any other language/mix).
- Reply strictly in the SAME language and script the patient used.
  Do not switch to English unless the patient wrote in English.

You are NOT a doctor. You must NOT:
- Give a definitive diagnosis.
- Prescribe or name specific prescription medicines or dosages.
- Give a rigid/strict diet chart for chronic conditions (like
  kidney disease, diabetes, liver disease) without knowing the
  stage, lab reports, or a doctor's evaluation. For such
  conditions, give general, safe, widely-accepted dietary
  direction (e.g. broad categories to prefer/limit) and clearly
  say that an exact plan depends on their reports/stage and needs
  a doctor or dietitian.

For your response, when relevant to the patient's message, cover:
1. Simple, general food/diet guidance (what generally helps, what
   to limit or avoid).
2. Basic self-care measures (rest, fluids/hydration, hygiene,
   general precautions) where applicable.
3. When they should see a doctor (timeframe / worsening signs).
4. RED-FLAG / EMERGENCY WARNING: if the message mentions or implies
   any serious/urgent signs (e.g. very high fever, difficulty
   breathing, chest pain, severe/persistent vomiting, blood in
   vomit/stool/urine, severe dehydration, confusion, fainting,
   very low or very high blood pressure readings, suspected
   kidney/heart/liver emergency, pregnancy complications, etc.),
   clearly and prominently advise the patient to seek urgent/
   emergency medical care immediately, in addition to any other
   guidance.

Keep the tone warm, simple, and easy to understand for a general
patient (not overly clinical). Keep it reasonably concise (use
short paragraphs or bullet points). Always end by recommending
they consult a hospital doctor for proper evaluation and a
personalized plan.
`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      const guidanceReply =
        guidanceCompletion.choices?.[0]?.message?.content?.trim() ||
        "Please consult a hospital doctor for proper evaluation.";

      // Attach a suitable doctor recommendation alongside the
      // guidance so the user has a clear next step.
      const hintedForGuidance = detectDepartmentHints(userMessage);
      let guidanceDoctors = [];
      let guidanceSpecialization = null;

      if (hintedForGuidance.length > 0) {
        for (const hint of hintedForGuidance) {
          const matches = await findDoctorsByName(hint);
          if (matches.length > 0) {
            guidanceDoctors = matches;
            guidanceSpecialization = hint;
            break;
          }
        }
      }

      if (guidanceDoctors.length === 0) {
        const fallbackDoctor = await getSuitableDoctor();
        if (fallbackDoctor) {
          guidanceDoctors = [fallbackDoctor];
          guidanceSpecialization =
            fallbackDoctor.department || fallbackDoctor.specialization || null;
        }
      }

      return res.status(200).json({
        success: true,
        type: "HEALTH_GUIDANCE",
        reply: guidanceReply,
        specialization: guidanceSpecialization,
        doctors: guidanceDoctors,
        form: null,
      });
    }

    // =====================================================
    // 4. GET AVAILABLE SPECIALIZATIONS
    // =====================================================

    const doctors = await Doctor.find({
      $or: [
        { specialization: { $exists: true, $ne: "" } },
        { department: { $exists: true, $ne: "" } },
      ],
    })
      .select("department specialization")
      .lean();

    const specialties = [
      ...new Set(
        doctors.flatMap((doctor) =>
          [doctor.specialization, doctor.department].filter(Boolean)
        )
      ),
    ];

    // =====================================================
    // 5. FAST PATH: KEYWORD-BASED DEPARTMENT HINTS
    // Checks the symptom/department keyword map first so obvious
    // cases (kidney pain, heart pain, tooth pain, etc.) don't need
    // a Groq call at all. Falls back to Groq only if no hint
    // matches, or a hinted department has no doctors in the DB.
    // =====================================================

    let aiSpecialization = null;
    let recommendedDoctors = [];
    let usedFastPath = false;

    const hintedDepartments = detectDepartmentHints(userMessage);

    if (hintedDepartments.length > 0) {
      for (const hint of hintedDepartments) {
        const matches = await findDoctorsByName(hint);

        if (matches.length > 0) {
          recommendedDoctors = matches;
          aiSpecialization = hint;
          usedFastPath = true;
          break;
        }
      }
    }

    // =====================================================
    // 6. FALLBACK: ASK GROQ FOR SPECIALIZATION
    // =====================================================

    if (!usedFastPath) {
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: `
You are a hospital AI assistant.

Available departments and specializations:

${specialties.join(", ")}

Identify the most relevant department or specialization
from the list.

RULES:

1. Return ONLY one exact name from the list.
2. Never invent a specialization.
3. Do not explain.
4. If there is no suitable match return NONE.
`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      aiSpecialization = completion.choices?.[0]?.message?.content?.trim();
      aiSpecialization = aiSpecialization?.replace(/^["']|["']$/g, "");

      console.log("AI Suggested Specialization:", aiSpecialization);

      // =====================================================
      // 7. FIND ACTUAL DOCTORS (Groq path)
      // =====================================================

      if (aiSpecialization && aiSpecialization.toUpperCase() !== "NONE") {
        recommendedDoctors = await findDoctorsByName(aiSpecialization);
      }
    }

    // =====================================================
    // 8. FINAL NORMAL RESPONSE
    // =====================================================

    let reply;

    if (recommendedDoctors.length > 0) {
      reply = `
Based on your question, **${aiSpecialization}** may be the relevant department or specialization.

Please consult a qualified doctor for proper evaluation.
`;
    } else {
      reply =
        "I could not find a matching doctor in our current database. Please contact the hospital or choose another department.";
    }

    return res.status(200).json({
      success: true,
      type: "GENERAL",
      reply,
      specialization:
        aiSpecialization && aiSpecialization.toUpperCase() !== "NONE"
          ? aiSpecialization
          : null,
      doctors: recommendedDoctors,
      form: null,
    });
  } catch (error) {
    console.error("Groq AI Error:", error);

    return res.status(500).json({
      success: false,
      message: "AI service is currently unavailable.",
      error: error.message,
    });
  }
};

// =====================================================
// FEVER ASSESSMENT
// =====================================================

const feverAssessment = async (req, res) => {
  try {
    const {
      age,
      duration,
      temperature,
      previousMedicine,
      medicineName,
      symptoms,
      allergies,
      medicalConditions,
    } = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (
      age === undefined ||
      duration === undefined ||
      temperature === undefined ||
      !previousMedicine
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fever details.",
      });
    }

    // =====================================================
    // GET SUITABLE DOCTOR
    // =====================================================

    const doctor = await getSuitableDoctor();

    // =====================================================
    // GET AVAILABLE MEDICINES
    // =====================================================

    const availableMedicines = await Medicine.find({
      isActive: true,
      quantity: { $gt: 0 },
      expiryDate: { $gt: new Date() },
    })
      .select("name brand composition unit requiresPrescription")
      .lean();

    // =====================================================
    // AI ANALYSIS
    // =====================================================

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `
You are a hospital AI assistant.

You are NOT a doctor and must not make a definitive diagnosis
or prescribe prescription medication.

Analyze the patient's fever information and provide safe,
general health guidance.

Patient information:

Age: ${age}
Fever duration: ${duration} days
Temperature: ${temperature} °F
Previous medicine taken: ${previousMedicine}
Medicine name: ${medicineName || "None"}
Other symptoms: ${symptoms || "None"}
Medicine allergies: ${allergies || "None"}
Existing medical conditions: ${medicalConditions || "None"}

Available medicines in the hospital pharmacy:

${availableMedicines
  .map(
    (medicine) =>
      `${medicine.name} | ${medicine.composition || ""} | Prescription required: ${medicine.requiresPrescription}`
  )
  .join("\n")}

IMPORTANT:

- Do not claim certainty.
- Do not diagnose the illness.
- Do not recommend prescription medicines without a doctor.
- Do not recommend antibiotics automatically.
- If the patient has potentially serious symptoms,
  advise urgent medical evaluation.
- Keep the response clear and concise.
- Tell the patient to consult the hospital doctor.
`,
        },
        {
          role: "user",
          content:
            "Please assess my fever information and tell me what I should do.",
        },
      ],
    });

    const aiReply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Please consult a doctor for proper evaluation.";

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      type: "FEVER_RESULT",
      reply: aiReply,
      doctor: doctor || null,
      advice: doctor
        ? "For proper examination and treatment, please contact the doctor and book an appointment."
        : "Please contact the hospital for a doctor appointment.",
      medicines: availableMedicines,
    });
  } catch (error) {
    console.error("FEVER ASSESSMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process fever assessment.",
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
  feverAssessment,
};