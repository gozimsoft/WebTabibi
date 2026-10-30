import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'ar' | 'en';

export interface Translations {
  appName: string;
  appBadge: string;
  internalZone: string;
  searchPlaceholder: string;
  searchShortcut: string;
  searchTitle: string;
  searchNoResults: string;
  searchHint: string;
  searchEsc: string;
  modulesTitle: string;
  infraTitle: string;
  printBtn: string;
  readingTime: string;
  validatedOn: string;
  writtenBy: string;
  revBy: string;
  levelL1: string;
  levelL2: string;
  levelL3: string;
  levelsCovered: string;
  doctorSymptomsTitle: string;
  escalationTitle: string;
  tagsLabel: string;
  clearFilter: string;
  activeFilter: string;
  viewProcedure: string;
  doctorCallsTitle: string;
  doctorCallsSubtitle: string;
  doctorSays: string;
  muraqibNotice: string;
  seeMuraqibDoc: string;
  statusValide: string;
  statusObsolete: string;
  statusAVerifier: string;
  selectArticleHint: string;
  categories: Record<string, { label: string; desc: string }>;
}

export const translations: Record<Language, Translations> = {
  fr: {
    appName: "TABIBI Knowledge Base",
    appBadge: "Support & Produit",
    internalZone: "Zone Interne Stellarsoft",
    searchPlaceholder: "Rechercher par mot-clé, symptôme, code d'erreur, fonction...",
    searchShortcut: "Ctrl K",
    searchTitle: "Recherche instantanée",
    searchNoResults: "Aucun article ne correspond à votre recherche. Essayez avec un mot plus simple ou un symptôme.",
    searchHint: "Utilisez ↑ / ↓ pour naviguer, Entrée pour ouvrir",
    searchEsc: "Échap pour fermer",
    modulesTitle: "Modules Cliniques & Cabinet",
    infraTitle: "Infrastructure & Déploiement",
    printBtn: "Imprimer / PDF",
    readingTime: "Lecture : ~{min} min",
    validatedOn: "Validé le :",
    writtenBy: "Rédigé par :",
    revBy: "Rev.",
    levelL1: "Niveau 1 (Réponse immédiate)",
    levelL2: "Niveau 2 (Vérification)",
    levelL3: "Niveau 3 (Diagnostic Infra)",
    levelsCovered: "Niveaux de support couverts par cet article :",
    doctorSymptomsTitle: "Symptômes types exprimés par le médecin au téléphone :",
    escalationTitle: "Critère d'escalade impératif vers Niveau 2 / Niveau 3 :",
    tagsLabel: "Mots-clés / Tags :",
    clearFilter: "Effacer",
    activeFilter: "Filtre actif :",
    viewProcedure: "Voir la procédure complète",
    doctorCallsTitle: "Section Réflexe : « Le médecin appelle »",
    doctorCallsSubtitle: "Matrice de diagnostic immédiat pour l'équipe de support Niveau 1 au téléphone.",
    doctorSays: "Ce que dit le médecin au téléphone :",
    muraqibNotice: "Cette section fait partie de l'infrastructure centrale. Afin d'éviter toute divergence technique, le contenu relatif au réseau, sauvegardes et serveurs est documenté dans Muraqib.",
    seeMuraqibDoc: "Consulter la documentation Muraqib dédiée",
    statusValide: "VALIDÉ",
    statusObsolete: "OBSOLÈTE",
    statusAVerifier: "À VÉRIFIER",
    selectArticleHint: "Sélectionnez un article dans le menu latéral pour afficher son contenu.",
    categories: {
      "reception": { label: "Accueil & Secrétariat", desc: "Arrivées, salle d'attente, enregistrement et encaissement." },
      "rendez-vous": { label: "Planning & Rendez-vous", desc: "Calendrier, créneaux, rappels et gestion des conflits." },
      "patients": { label: "Dossiers Patients", desc: "Identité, antécédents, constantes, allergies et historique." },
      "consultations": { label: "Consultation Clinique", desc: "Cycle de vie, étapes d'examen, pause/reprise et clôture." },
      "prescriptions": { label: "Prescriptions & Ordonnances", desc: "Immuabilité, posologies, impression, duplicata et avenants." },
      "documents-medicaux": { label: "Documents Médicaux & GED", desc: "Numérisation, webcam, visionneuse plein cadre et comparaison 'C'." },
      "dicom": { label: "Imagerie & DICOM", desc: "Visualiseur PACS, coupes axiales/sagittales et fenêtrage." },
      "dentaire": { label: "Cabinet Dentaire & Odontogramme", desc: "Schéma dentaire FDI, actes cliniques et devis." },
      "certificats-rapports": { label: "Certificats & Rapports", desc: "Aptitude, dispenses, lettres de liaison et orientation." },
      "medicaments": { label: "Médicaments & Nomenclature DCI", desc: "Base officielle algérienne, posologies et contre-indications." },
      "gestion": { label: "Statistiques & Gestion Cabinet", desc: "Activité, chiffre d'affaires, rapports et droits RBAC." },
      "parametres": { label: "Paramètres & Configuration", desc: "En-têtes d'ordonnance, imprimantes, licences et sauvegardes." },
      "le-medecin-appelle": { label: "Le Médecin Appelle (Urgences N1)", desc: "Arbre réflexe de diagnostic rapide au téléphone." },
      "faq-medecins": { label: "FAQ & Raccourcis Clavier", desc: "Touches rapides (F1, C, Échap), bilingue FR/AR et astuces." },
      "installation": { label: "Installation & Poste Client", desc: "Prérequis Windows, installateur Electron et drivers." },
      "reseau-serveur": { label: "Réseau Local & Serveur", desc: "Architecture LAN, ports 5000/3306 et basculement." },
      "sauvegarde": { label: "Sauvegardes & Restauration", desc: "Dumps SQL quotidiens et reprise après sinistre." },
      "securite": { label: "Sécurité & Contrôle d'Accès", desc: "Secret médical, chiffrement et rôles utilisateurs." }
    }
  },
  ar: {
    appName: "قاعدة معرفة طبيبي (TABIBI KB)",
    appBadge: "الدعم الفني والمنتج",
    internalZone: "منطقة داخلية - سيلارسوفت",
    searchPlaceholder: "البحث بالكلمة المفتاحية، العَرَض، رمز الخطأ، الوظيفة...",
    searchShortcut: "Ctrl K",
    searchTitle: "بحث فوري",
    searchNoResults: "لم يتم العثور على أي مقال يطابق بحثك. جرب كلمة أبسط أو العَرَض الذي يصفه الطبيب.",
    searchHint: "استخدم الأسهم للتنقل، وزر الإدخال للفتح",
    searchEsc: "زر الهروب (Échap) للإغلاق",
    modulesTitle: "الوحدات السريرية والعيادة",
    infraTitle: "البنية التحتية والنشر",
    printBtn: "طباعة / PDF",
    readingTime: "مدة القراءة: ~{min} دقيقة",
    validatedOn: "تم الاعتماد في:",
    writtenBy: "إعداد:",
    revBy: "مراجعة:",
    levelL1: "المستوى 1 (إجابة فورية عبر الهاتف)",
    levelL2: "المستوى 2 (تحقق تقني)",
    levelL3: "المستوى 3 (تشخيص الخادم والبنية)",
    levelsCovered: "مستويات الدعم الفني المغطاة في هذا المقال:",
    doctorSymptomsTitle: "الأعراض والعبارات النموذجية التي يقولها الطبيب هاتفياً:",
    escalationTitle: "معيار التصعيد الإجباري إلى المستوى 2 أو 3:",
    tagsLabel: "الكلمات المفتاحية والوسوم:",
    clearFilter: "مسح الفلتر",
    activeFilter: "الفلتر النشط:",
    viewProcedure: "عرض الإجراء الكامل",
    doctorCallsTitle: "قسم الطوارئ: «الطبيب يتصل»",
    doctorCallsSubtitle: "مصفوفة التشخيص الفوري لفريق الدعم الفني (المستوى 1) أثناء الاتصال الهاتفي.",
    doctorSays: "ما يقوله الطبيب عبر الهاتف:",
    muraqibNotice: "هذا القسم يتبع البنية التحتية المركزية. لتفادي تضارب المعلومات، تم توثيق تفاصيل الشبكة والنسخ الاحتياطي في منصة مراقب (Muraqib).",
    seeMuraqibDoc: "الاطلاع على وثائق منصة مراقب المخصصة",
    statusValide: "معتمد",
    statusObsolete: "ملغى / قديم",
    statusAVerifier: "قيد المراجعة",
    selectArticleHint: "اختر مقالاً من القائمة الجانبية لعرض محتواه وتفاصيله التقنية.",
    categories: {
      "reception": { label: "الاستقبال والسكرتارية", desc: "تسجيل المرضى، قاعة الانتظار، والتحصيل." },
      "rendez-vous": { label: "المواعيد وجدول العمل", desc: "الأجندة، الفترات الزمنية، وتفادي التداخل." },
      "patients": { label: "ملفات وسجلات المرضى", desc: "الهوية، السوابق، الحساسية، والقياسات الحيوية." },
      "consultations": { label: "الفحص والاستشارة الطبية", desc: "دورة الفحص، الخطوات السريرية، والإيقاف المؤقت." },
      "prescriptions": { label: "الوصفات الطبية والمحررات", desc: "عدم قابلية التعديل، الجرعات، النسخ المتطابقة والملاحق." },
      "documents-medicaux": { label: "المستندات والأرشيف الطبي (GED)", desc: "المسح بالكاميرا/السكانر، عارض الشاشة الكاملة والمقارنة." },
      "dicom": { label: "التصوير الإشعاعي (DICOM)", desc: "عارض صور الأشعة المقطعية، المقاطع، والقياسات." },
      "dentaire": { label: "عيادة الأسنان ومخطط الأسنان", desc: "مخطط الأسنان FDI، الإجراءات، والمقايسات." },
      "certificats-rapports": { label: "الشهادات والتقارير الطبية", desc: "شهادات القدرة البدنية، التبريرات، وخطابات التوجيه." },
      "medicaments": { label: "الأدوية والتسمية العلمية (DCI)", desc: "القائمة الوطنية للأدوية في الجزائر وموانع الاستعمال." },
      "gestion": { label: "الإحصائيات وإدارة العيادة", desc: "النشاط، المداخيل، التقارير وصلاحيات المستخدمين." },
      "parametres": { label: "الإعدادات والتهيئة", desc: "ترويسة الوصفة، الطابعات، والتراخيص." },
      "le-medecin-appelle": { label: "الطبيب يتصل (طوارئ الدعم)", desc: "شجرة القرارات والتشخيص الفوري عبر الهاتف." },
      "faq-medecins": { label: "الأسئلة الشائعة واختصارات لوحة المفاتيح", desc: "الاختصارات السريعة (F1, C, Échap) والعمل باللغتين." },
      "installation": { label: "التثبيت ونشر الأجهزة", desc: "متطلبات ويندوز وتثبيت التطبيق وتعريفات الطابعات." },
      "reseau-serveur": { label: "الشبكة المحلية والخادم", desc: "هيكلية LAN، المنافذ 5000/3306، والعمل أوفلاين." },
      "sauvegarde": { label: "النسخ الاحتياطي والاسترجاع", desc: "تصدير قواعد البيانات اليومي وخطط التعافي." },
      "securite": { label: "الأمان والتحكم بالوصول (RBAC)", desc: "السرية الطبية وتشفير البيانات وأدوار المستخدمين." }
    }
  },
  en: {
    appName: "TABIBI Knowledge Base",
    appBadge: "Support & Product",
    internalZone: "Stellarsoft Internal Zone",
    searchPlaceholder: "Search by keyword, symptom, error code, feature...",
    searchShortcut: "Ctrl K",
    searchTitle: "Instant Search",
    searchNoResults: "No articles match your search. Try using simpler terms or doctor's verbatim symptom.",
    searchHint: "Use ↑ / ↓ to navigate, Enter to open",
    searchEsc: "Esc to close",
    modulesTitle: "Clinical & Practice Modules",
    infraTitle: "Infrastructure & Deployment",
    printBtn: "Print / PDF",
    readingTime: "Read: ~{min} min",
    validatedOn: "Validated on:",
    writtenBy: "Authored by:",
    revBy: "Rev.",
    levelL1: "Level 1 (Immediate Phone Response)",
    levelL2: "Level 2 (Technical Verification)",
    levelL3: "Level 3 (Advanced Infra Diagnostics)",
    levelsCovered: "Support levels covered in this article:",
    doctorSymptomsTitle: "Typical verbatim symptoms reported by the doctor over the phone:",
    escalationTitle: "Mandatory escalation criteria to Level 2 / Level 3:",
    tagsLabel: "Keywords / Tags:",
    clearFilter: "Clear",
    activeFilter: "Active filter:",
    viewProcedure: "View full procedure",
    doctorCallsTitle: "Emergency Section: «Doctor Calling»",
    doctorCallsSubtitle: "Immediate decision matrix for Level 1 support team over the phone.",
    doctorSays: "What the doctor says on the phone:",
    muraqibNotice: "This section relates to core infrastructure. To prevent diverging documentation, server, backup and network topics are centralized in Muraqib.",
    seeMuraqibDoc: "Open dedicated Muraqib documentation",
    statusValide: "VALIDATED",
    statusObsolete: "OBSOLETE",
    statusAVerifier: "NEEDS REVIEW",
    selectArticleHint: "Select an article from the sidebar to inspect its technical details.",
    categories: {
      "reception": { label: "Reception & Front Desk", desc: "Patient intake, waiting room queue, and billing." },
      "rendez-vous": { label: "Scheduling & Appointments", desc: "Calendar, time slots, reminders, and conflict prevention." },
      "patients": { label: "Patient Records & Charts", desc: "Identity, medical history, vital signs, and allergies." },
      "consultations": { label: "Clinical Consultation", desc: "Lifecycle, examination steps, pause/resume, and closure." },
      "prescriptions": { label: "Prescriptions & Orders", desc: "Immutability, dosing, printing, duplicates, and addendums." },
      "documents-medicaux": { label: "Medical Documents & EDMS", desc: "Webcam/scanner intake, fullscreen viewer, and 'C' compare." },
      "dicom": { label: "Medical Imaging & DICOM", desc: "PACS viewer, axial/sagittal slices, and windowing." },
      "dentaire": { label: "Dental Practice & Odontogram", desc: "FDI tooth chart, clinical procedures, and quotes." },
      "certificats-rapports": { label: "Certificates & Letters", desc: "Fitness certificates, waivers, and referral letters." },
      "medicaments": { label: "Drugs & INN Nomenclature", desc: "Algerian national drug database, dosages, and interactions." },
      "gestion": { label: "Practice Analytics & Management", desc: "Activity, revenue reports, and RBAC permissions." },
      "parametres": { label: "Settings & Configuration", desc: "Prescription letterheads, printers, and licenses." },
      "le-medecin-appelle": { label: "Doctor Calling (L1 Emergency)", desc: "Immediate phone triage and decision tree." },
      "faq-medecins": { label: "FAQ & Keyboard Shortcuts", desc: "Hotkeys (F1, C, Esc), bilingual FR/AR, and productivity tips." },
      "installation": { label: "Installation & Workstation", desc: "Windows prerequisites, Electron setup, and printer drivers." },
      "reseau-serveur": { label: "Local Network & Server", desc: "LAN topology, ports 5000/3306, and offline mode." },
      "sauvegarde": { label: "Backup & Recovery", desc: "Automated daily SQL dumps and disaster recovery." },
      "securite": { label: "Security & Access Control (RBAC)", desc: "Medical secrecy, data encryption, and user roles." }
    }
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('tabibi_kb_lang') as Language;
      if (saved && (saved === 'fr' || saved === 'ar' || saved === 'en')) return saved;
      return 'fr';
    } catch {
      return 'fr';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('tabibi_kb_lang', lang);
    } catch {}
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
    isRTL
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
