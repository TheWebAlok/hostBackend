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
// (this is the flow that triggers the structured fever FORM,
//  not a general "tell me about this medicine" question)
// =====================================================

const isFeverMedicineQuestion = (message) => {
  const text = message.toLowerCase().trim();

  const feverWords = ["fever", "bukhar", "बुखार", "temperature", "high temperature"];

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
// GENERAL HEALTH QUESTION HANDLING (covers ANY question)
// =====================================================
// Instead of matching against a fixed list of keywords (which can
// never cover every possible way a patient phrases a question),
// every message that isn't hospital-services or the fever-form
// trigger is sent to Groq ONCE, asking it to:
//   1. Decide whether this is a health-related question at all
//      (symptom, disease, medicine, diet, precaution, general
//      medical knowledge, mental health, etc. — anything at all).
//   2. If yes, give a proper, safe, accurate answer to THAT exact
//      question (not a generic "see a doctor" non-answer).
//   3. Identify the closest matching hospital department/
//      specialization from the provided list, if any, so we can
//      still recommend a relevant doctor.
// This lets a patient ask literally anything health-related and
// get a real answer, instead of only the handful of patterns the
// old keyword lists happened to cover.
// =====================================================

const buildGeneralHealthPrompt = (specialtiesList) => `
You are a hospital AI assistant. A patient has sent you a message.
It could be ANY kind of health-related question (symptom, disease,
medicine, diet/nutrition, precaution, general medical knowledge,
mental health, first aid, pregnancy, child health, elderly care,
lab test meaning, etc.) — do not limit yourself to any fixed list
of topics. It could also be a non-health message (e.g. asking to
book an appointment, asking for a doctor directly, greetings,
unrelated chit-chat).

CRITICAL LANGUAGE RULE:
- Detect the language/script the patient used (Hindi, English,
  Hinglish, Gujarati, or any other language/mix).
- Your "reply" field must be strictly in the SAME language and
  script the patient used. Do not switch to English unless the
  patient wrote in English.

You are NOT a doctor. You must NOT:
- Give a definitive diagnosis.
- Prescribe or name specific prescription medicines with exact
  personalized dosages.
- Give a rigid/strict diet chart for chronic conditions without
  knowing the stage, lab reports, or a doctor's evaluation.

When the question IS health-related, your "reply" must be a real,
accurate, specific, helpful answer to what was actually asked —
not a vague "please see a doctor" non-answer. Depending on what's
relevant, cover:
1. A clear, correct answer to the actual question asked.
2. General food/diet or self-care guidance if relevant (what
   generally helps, what to limit/avoid), framed as general safe
   information, not a rigid personalized plan.
3. When they should see a doctor (timeframe / worsening signs).
4. RED-FLAG / EMERGENCY WARNING: if the message mentions or implies
   any serious/urgent signs (very high fever, difficulty breathing,
   chest pain, severe/persistent vomiting, blood in vomit/stool/
   urine, severe dehydration, confusion, fainting, very abnormal
   BP readings, suspected kidney/heart/liver emergency, pregnancy
   complications, suicidal thoughts, etc.), clearly and prominently
   advise seeking urgent/emergency medical care immediately.

Keep the tone warm, simple, and easy to understand for a general
patient (not overly clinical). Keep it reasonably concise (short
paragraphs or bullet points). If it is a genuine health question,
end the reply by recommending they consult a hospital doctor for
personalized evaluation.

If the message is NOT a health question at all (e.g. just wants a
doctor list, wants to book an appointment, greeting, unrelated),
set "isHealthQuestion" to false and leave "reply" as an empty
string — do not force an answer.

Available hospital departments/specializations:
${specialtiesList.join(", ")}

Respond with ONLY a raw JSON object, no markdown, no code fences,
no extra text, in exactly this shape:
{
  "isHealthQuestion": true or false,
  "reply": "the answer in the patient's language, or empty string",
  "specialization": "the single closest exact name from the list above, or NONE"
}
`;

const parseGeneralHealthJSON = (raw) => {
  if (!raw) return null;
  const cleaned = raw.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // try to salvage a JSON object embedded in extra text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerErr) {
        return null;
      }
    }
    return null;
  }
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
    // 2. FEVER MEDICINE QUESTION -> structured fever FORM
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
    // 3. GET AVAILABLE SPECIALIZATIONS (needed either way, for
    //    department matching)
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
    // 4. FAST PATH: KEYWORD-BASED DEPARTMENT HINTS
    // Cheap, deterministic check for obvious "find me a doctor"
    // style messages (kidney pain, heart pain, tooth pain, etc.)
    // so those don't need a Groq round-trip at all. Anything that
    // doesn't hit this fast path goes to the general health
    // question/answer handler below, which can also still resolve
    // a department on its own.
    // =====================================================

    const hintedDepartments = detectDepartmentHints(userMessage);
    let fastPathDoctors = [];
    let fastPathSpecialization = null;

    if (hintedDepartments.length > 0) {
      for (const hint of hintedDepartments) {
        const matches = await findDoctorsByName(hint);
        if (matches.length > 0) {
          fastPathDoctors = matches;
          fastPathSpecialization = hint;
          break;
        }
      }
    }

    // =====================================================
    // 5. GENERAL HEALTH QUESTION / ANSWER HANDLER
    // This is the main upgrade: ANY message that reaches this
    // point (not hospital-services, not the fever-form trigger)
    // is sent to Groq once. Groq itself decides whether it's a
    // real health question and, if so, gives a proper direct
    // answer — instead of relying on a fixed keyword list that
    // can never cover every way a patient might ask something.
    // =====================================================

    const generalCompletion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: buildGeneralHealthPrompt(specialties),
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const rawGeneral =
      generalCompletion.choices?.[0]?.message?.content?.trim() || "";
    const parsedGeneral = parseGeneralHealthJSON(rawGeneral);

    console.log("AI General Handler Output:", parsedGeneral || rawGeneral);

    const isHealthQuestion = Boolean(parsedGeneral?.isHealthQuestion);
    let aiSpecialization =
      parsedGeneral?.specialization &&
      parsedGeneral.specialization.toUpperCase() !== "NONE"
        ? parsedGeneral.specialization.replace(/^["']|["']$/g, "")
        : null;

    // =====================================================
    // 6a. IT IS A REAL HEALTH QUESTION -> answer it directly
    // =====================================================

    if (isHealthQuestion) {
      const healthReply =
        parsedGeneral?.reply?.trim() ||
        "Please consult a hospital doctor for proper evaluation.";

      // Prefer the fast-path department match (more reliable,
      // deterministic) if we found one; otherwise fall back to
      // whatever Groq identified, otherwise the safe default
      // "general medicine" doctor.
      let doctors = fastPathDoctors;
      let specialization = fastPathSpecialization;

      if (doctors.length === 0 && aiSpecialization) {
        doctors = await findDoctorsByName(aiSpecialization);
        specialization = doctors.length > 0 ? aiSpecialization : null;
      }

      if (doctors.length === 0) {
        const fallbackDoctor = await getSuitableDoctor();
        if (fallbackDoctor) {
          doctors = [fallbackDoctor];
          specialization =
            fallbackDoctor.department || fallbackDoctor.specialization || null;
        }
      }

      return res.status(200).json({
        success: true,
        type: "HEALTH_ANSWER",
        reply: healthReply,
        specialization,
        doctors,
        form: null,
      });
    }

    // =====================================================
    // 6b. NOT A HEALTH QUESTION -> treat as a plain
    // doctor/department search (old behaviour)
    // =====================================================

    let recommendedDoctors = fastPathDoctors;

    if (recommendedDoctors.length === 0 && aiSpecialization) {
      recommendedDoctors = await findDoctorsByName(aiSpecialization);
    }

    if (fastPathSpecialization) {
      aiSpecialization = fastPathSpecialization;
    }

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
      specialization: aiSpecialization || null,
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