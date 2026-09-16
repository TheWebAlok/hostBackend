// =====================================================
// SYMPTOM / DEPARTMENT DETECTION
// English + Hinglish + Hindi
// =====================================================

const detectDepartmentHints = (message) => {
  const text = message.toLowerCase().trim();

  const rules = [
    {
      names: ["Urology", "Nephrology"],
      words: [
        "kidney",
        "renal",
        "urine",
        "urinary",
        "kidney stone",
        "stone in kidney",
        "kidney pain",
        "kidney problem",

        "peshab",
        "peshaab",
        "urine problem",
        "urine pain",
        "peshab me dard",
        "peshab mein dard",
        "peshab me jalan",
        "peshab mein jalan",
        "gurda",
        "gurde",
        "gurde me dard",
        "gurde mein dard",

        "kidni",
        "किडनी",
        "गुर्दा",
        "गुर्दे",
        "पेशाब",
        "पेशाब में दर्द",
        "पेशाब में जलन",
        "किडनी स्टोन",
        "गुर्दे में दर्द",
      ],
    },

    {
      names: ["Cardiology"],
      words: [
        "heart",
        "cardiac",
        "heart pain",
        "chest pain",
        "heart problem",

        "dil",
        "dil me dard",
        "dil mein dard",
        "seene me dard",
        "seene mein dard",

        "दिल",
        "दिल में दर्द",
        "सीने में दर्द",
        "हृदय",
        "हृदय में दर्द",
      ],
    },

    {
      names: ["Neurology"],
      words: [
        "brain",
        "neurology",
        "migraine",
        "severe headache",
        "headache",
        "dizziness",
        "numbness",
        "seizure",

        "chakkar",
        "sar dard",
        "sir dard",
        "sar mein dard",
        "sir me dard",

        "दिमाग",
        "माइग्रेन",
        "सिर दर्द",
        "सर दर्द",
        "चक्कर",
        "सुन्न",
        "दौरा",
      ],
    },

    {
      names: ["Orthopedics"],
      words: [
        "bone",
        "bones",
        "joint",
        "joints",
        "fracture",
        "back pain",
        "knee pain",
        "shoulder pain",
        "joint pain",

        "haddi",
        "haddi me dard",
        "ghutne me dard",
        "kamar dard",
        "kandhe me dard",

        "हड्डी",
        "हड्डी में दर्द",
        "घुटने में दर्द",
        "कमर दर्द",
        "कंधे में दर्द",
        "जोड़ों में दर्द",
        "फ्रैक्चर",
      ],
    },

    {
      names: ["Dermatology"],
      words: [
        "skin",
        "skin problem",
        "rash",
        "acne",
        "pimples",
        "itching",
        "skin allergy",

        "twacha",
        "chambdi",
        "khujli",

        "त्वचा",
        "त्वचा की समस्या",
        "चकत्ते",
        "मुंहासे",
        "खुजली",
        "स्किन",
      ],
    },

    {
      names: ["Ophthalmology"],
      words: [
        "eye",
        "eyes",
        "eye pain",
        "vision",
        "blurred vision",
        "eye problem",

        "aankh",
        "aankhon",
        "aankh me dard",
        "aankh mein dard",

        "आंख",
        "आँख",
        "आंखों",
        "दृष्टि",
        "आंख में दर्द",
      ],
    },

    {
      names: ["ENT"],
      words: [
        "ear",
        "nose",
        "throat",
        "ent",
        "ear pain",
        "sore throat",

        "kaan",
        "naak",
        "gala",
        "kaan me dard",
        "gale me dard",

        "कान",
        "नाक",
        "गला",
        "कान में दर्द",
        "गले में दर्द",
      ],
    },

    {
      names: ["Dental"],
      words: [
        "tooth",
        "teeth",
        "dental",
        "gum",
        "tooth pain",

        "daant",
        "daant me dard",

        "दांत",
        "दाँत",
        "दांत में दर्द",
        "मसूड़े",
      ],
    },

    {
      names: ["Gynecology"],
      words: [
        "period",
        "periods",
        "pregnancy",
        "pregnant",
        "gynecology",
        "women",
        "period problem",

        "mahila",
        "mahila problem",

        "मासिक धर्म",
        "पीरियड",
        "गर्भावस्था",
        "गर्भवती",
        "महिला रोग",
      ],
    },

    {
      names: ["Pediatrics"],
      words: [
        "child",
        "children",
        "baby",
        "kid",
        "pediatric",

        "baccha",
        "bachcha",
        "bachche",
        "baby problem",

        "बच्चा",
        "बच्चे",
        "शिशु",
        "बाल रोग",
      ],
    },
  ];

  for (const rule of rules) {
    if (rule.words.some((word) => text.includes(word))) {
      return rule.names;
    }
  }

  return [];
};

module.exports = { detectDepartmentHints };