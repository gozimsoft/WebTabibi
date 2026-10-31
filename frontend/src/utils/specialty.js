// src/utils/specialty.js

export const SPECIALTY_TRANSLATIONS = {
  "02045ec7-5fac-50f9-b560-599b2fb3e597": { ar: "أخصائي أمراض الكلى", fr: "Néphrologie", en: "Nephrology" },
  "0f7c8954-50a0-56aa-b4b3-880405974f1b": { ar: "طب التغذية و الحمية", fr: "Nutrition et diététique", en: "Nutrition & Dietetics" },
  "21d9f58e-45f9-43c0-886b-573c495afa8f": { ar: "جراحة الوجه والفكين", fr: "Chirurgie maxillo-faciale", en: "Maxillofacial Surgery" },
  "22a550cc-08c5-5bdf-a3cc-44f1105edad2": { ar: "الأمراض المعدية", fr: "Maladies infectieuses", en: "Infectious Diseases" },
  "2d3e3093-761b-5545-a330-3b1e0ba479f8": { ar: "طب النساء والتوليد", fr: "Gynécologie-obstétrique", en: "Gynecology & Obstetrics" },
  "2ee88075-70d1-5fde-9b97-d99b19d7a0ba": { ar: "طب الجهاز الهضمي", fr: "Gastro-entérologie", en: "Gastroenterology" },
  "4ccb860f-60e8-5a60-a7d7-54992cf8fe62": { ar: "طب الأمراض الصدرية و الجهاز التنفسي", fr: "Pneumologie", en: "Pulmonology" },
  "699dae92-09c2-58e2-b8bf-fe076b29e750": { ar: "طب أمراض القلب", fr: "Cardiologie", en: "Cardiology" },
  "73560649-9d1c-500b-94ef-99ae476117b5": { ar: "أمراض الحساسية", fr: "Allergologie", en: "Allergology" },
  "83ca1c62-c4e2-59e2-9c47-74d5b9c9c5e3": { ar: "الامراض العقلية و النفسية", fr: "Psychiatrie et santé mentale", en: "Psychiatry & Mental Health" },
  "8d5e2dd7-84e8-552b-a207-2f48bf276baa": { ar: "طب وجراحة الأنف والأذن والحنجرة", fr: "Oto-rhino-laryngologie (ORL)", en: "ENT (Otolaryngology)" },
  "a98e56c2-388c-58bb-a99d-8958c73e9d91": { ar: "الطب الباطني (داخلي)", fr: "Médecine interne", en: "Internal Medicine" },
  "b435dc57-cc0a-522d-b1dd-981995f1aaa1": { ar: "الأمراض الجلدية والتناسلية", fr: "Dermatologie et vénéréologie", en: "Dermatology & Venereology" },
  "c4e3b725-3b4b-5d45-a8fc-6c7fb5dc9b52": { ar: "طب وجراحة المسالك البولية", fr: "Urologie", en: "Urology" },
  "c8ca47a9-2fd0-56d6-b36a-4339d1836372": { ar: "طب وجراحة الأطفال", fr: "Pédiatrie et chirurgie pédiatrique", en: "Pediatrics & Pediatric Surgery" },
  "da195033-5b58-11f0-9c01-525400088b55": { ar: "طب عام", fr: "Médecine générale", en: "General Medicine" },
  "da1952ab-5b58-11f0-9c01-525400088b55": { ar: "جراحة عامة", fr: "Chirurgie générale", en: "General Surgery" },
  "da1952e0-5b58-11f0-9c01-525400088b55": { ar: "الطب الفيزيائي وإعادة التأهيل الحركي", fr: "Médecine physique et réadaptation", en: "Physical Medicine & Rehabilitation" },
  "da19538c-5b58-11f0-9c01-525400088b55": { ar: "الطب النووي", fr: "Médecine nucléaire", en: "Nuclear Medicine" },
  "da1953ea-5b58-11f0-9c01-525400088b55": { ar: "طب وجراحة تجميلية", fr: "Chirurgie plastique et esthétique", en: "Plastic & Aesthetic Surgery" },
  "da195401-5b58-11f0-9c01-525400088b55": { ar: "طب التخدير", fr: "Anesthésiologie-réanimation", en: "Anesthesiology & Intensive Care" },
  "de4a01ab-212e-5ac1-9470-0450e10e8ddb": { ar: "مرض السكري و الغدد الصماء", fr: "Endocrinologie et diabétologie", en: "Endocrinology & Diabetology" },
  "defd6b4d-3bae-5da4-a724-b9faa642d603": { ar: "طب وجراحة الأسنان", fr: "Médecine et chirurgie dentaire", en: "Dentistry & Dental Surgery" },
  "e72c35d6-8bb9-558c-95e2-4ac65c608e6a": { ar: "علم الأشعة_راديولوجي", fr: "Radiologie et imagerie médicale", en: "Radiology & Medical Imaging" },
  "e905b54a-7be6-5676-9ed5-8cb8442cab50": { ar: "طب العظام و المفاصل", fr: "Orthopédie et traumatologie", en: "Orthopedics & Traumatology" },
  "ef64a1a4-b6b6-55d3-8fbc-52423b032d80": { ar: "طب وجراحة المخ و الأعصاب", fr: "Neurologie et neurochirurgie", en: "Neurology & Neurosurgery" },
  "fbd41163-0635-5e40-bc7a-ec836ba76239": { ar: "طب أمراض الدم والأورام", fr: "Hématologie et oncologie", en: "Hematology & Oncology" },
  "fdb203c8-7b0d-5800-a7dc-b2a51571eed1": { ar: "طب وجراحة العيون", fr: "Ophtalmologie", en: "Ophthalmology" }
};

/**
 * Returns the localized name of a specialty for a given language ('ar', 'fr', 'en').
 * @param {Object|string} spec - Specialty object or name string
 * @param {string} lang - Current language ('ar', 'fr', 'en')
 * @returns {string} Localized specialty name
 */
export function formatSpecialty(spec, lang = 'fr') {
  if (!spec) return "";
  const l = (lang || 'fr').toLowerCase().slice(0, 2);

  // If spec is an object with id/specialtyid or name fields
  if (typeof spec === 'object') {
    const id = spec.id || spec.specialtyid || spec.specialtie_id;
    if (id && SPECIALTY_TRANSLATIONS[id]) {
      return SPECIALTY_TRANSLATIONS[id][l] || SPECIALTY_TRANSLATIONS[id].fr;
    }
    if (l === 'ar') return spec.namear || spec.specialtyar || spec.namefr || spec.specialtyfr || "";
    if (l === 'en') return spec.nameen || spec.specialtyen || spec.namefr || spec.specialtyfr || "";
    return spec.namefr || spec.specialtyfr || spec.namear || spec.specialtyar || "";
  }

  // If spec is a string (e.g. namefr, namear, nameen)
  const str = String(spec).trim();
  for (const item of Object.values(SPECIALTY_TRANSLATIONS)) {
    if (
      item.fr.toLowerCase() === str.toLowerCase() ||
      item.ar === str ||
      item.en.toLowerCase() === str.toLowerCase()
    ) {
      return item[l] || item.fr;
    }
  }

  return str;
}
