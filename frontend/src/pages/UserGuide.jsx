import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  ChevronRight, ChevronLeft, Smartphone, Search, Calendar, 
  Clock, MessageSquare, CheckCircle, Info, Check, Play, X,
  Palette, ExternalLink, Sparkles
} from "lucide-react";

export const SPECIALTY_GUIDE_ITEMS = [
  {
    key: "cardio",
    color: "#ef4444",
    fr: "Cardiologie",
    ar: "أمراض القلب",
    en: "Cardiology",
    icon: "❤️",
    desc_fr: "Spécialiste du cœur, des vaisseaux sanguins et de la tension artérielle. À consulter en cas de palpitations, douleurs à la poitrine ou essoufflement anormal.",
    desc_ar: "مختص في أمراض القلب، الشرايين وارتفاع ضغط الدم. يُستشار عند الشعور بآلام في الصدر، خفقان غير معتاد أو ضيق مفاجئ في التنفس.",
    desc_en: "Specialist in heart, blood vessels, and blood pressure. Consult for chest pain, palpitations, or abnormal shortness of breath."
  },
  {
    key: "pediatrie",
    color: "#f59e0b",
    fr: "Pédiatrie",
    ar: "طب الأطفال",
    en: "Pediatrics",
    icon: "👶",
    desc_fr: "Médecin dédié à la santé des nourrissons, enfants et adolescents. Assure le suivi de la croissance, les vaccins et soigne les maladies infantiles.",
    desc_ar: "طبيب مختص في رعاية الرضع، الأطفال والمراهقين. يتابع مراحل النمو والتطعيمات ويعالج نزلات البرد ومختلف أمراض الطفولة.",
    desc_en: "Doctor dedicated to infants, children, and teens. Manages growth tracking, vaccines, and common childhood illnesses."
  },
  {
    key: "ophtalmo",
    color: "#06b6d4",
    fr: "Ophtalmologie",
    ar: "طب وجراحة العيون",
    en: "Ophthalmology",
    icon: "👁️",
    desc_fr: "Spécialiste des yeux et de la vision. Il mesure votre acuité visuelle, prescrit lunettes ou lentilles et traite cataracte, glaucome et conjonctivite.",
    desc_ar: "مختص في فحص النظر وصحة العين. يصف النظارات والعدسات الطبية، ويعالج أمراض وجراحة العيون كالمياه البيضاء وضغط العين.",
    desc_en: "Eye and vision specialist. Tests eyesight, prescribes corrective glasses or lenses, and treats cataracts, glaucoma, and eye infections."
  },
  {
    key: "dermato",
    color: "#ec4899",
    fr: "Dermatologie",
    ar: "الأمراض الجلدية",
    en: "Dermatology",
    icon: "✨",
    desc_fr: "Médecin de la peau, des cheveux et des ongles. Soigne l'acné, l'eczéma, le psoriasis, la chute de cheveux et assure le dépistage des grains de beauté.",
    desc_ar: "مختص في علاج أمراض الجلد، الشعر والأظافر. يعالج حب الشباب، الإكزيما، الصدفية، تساقط الشعر ويجري فحص الشامات والزوائد الجلدية.",
    desc_en: "Skin, hair, and nail specialist. Treats acne, eczema, psoriasis, hair loss, and performs routine mole and skin health checks."
  },
  {
    key: "neuro",
    color: "#8b5cf6",
    fr: "Neurologie",
    ar: "أمراض المخ والأعصاب",
    en: "Neurology",
    icon: "🧠",
    desc_fr: "Spécialiste du système nerveux et du cerveau. Soigne les migraines intenses, vertiges, tremblements, épilepsie et troubles de la mémoire ou de la marche.",
    desc_ar: "مختص في الجهاز العصبي، المخ والأعصاب. يعالج الصداع النصفي الشديد، الدوار، التشنجات، الصرع واضطرابات الذاكرة وتوازن الحركة.",
    desc_en: "Nervous system and brain specialist. Treats severe migraines, dizziness, tremors, epilepsy, and memory or mobility issues."
  },
  {
    key: "general",
    color: "#0891b2",
    fr: "Médecine générale",
    ar: "الطب العام",
    en: "General Medicine",
    icon: "🩺",
    desc_fr: "Médecin de famille et interlocuteur de premier recours. Il diagnostique les maux du quotidien, soigne toute la famille et vous oriente si besoin.",
    desc_ar: "طبيب العائلة ونقطة الاتصال الأولى لأي شكوى صحية. يشخص الأمراض اليومية، يقدم الفحوصات الشاملة ويوجهك للمختص المناسب عند الحاجة.",
    desc_en: "Primary care family physician. Diagnoses everyday health concerns, provides general checkups, and refers to specialists when necessary."
  },
  {
    key: "dentaire",
    color: "#10b981",
    fr: "Dentisterie",
    ar: "جراحة وطب الأسنان",
    en: "Dentistry",
    icon: "🦷",
    desc_fr: "Soigne les dents, gencives et mâchoires. Réalise détartrages, soigne les caries, soulage les rages de dents et pose couronnes ou implants.",
    desc_ar: "طبيب وجراح الأسنان واللثة. يقوم بعلاج التسوس، تنظيف وتبييض الأسنان، تركيب الحشوات والجسور وزراعة الأسنان وتسكين آلام الفم.",
    desc_en: "Oral and dental healthcare expert. Treats cavities, performs cleanings, relieves toothaches, and places crowns or dental implants."
  },
  {
    key: "gyneco",
    color: "#f43f5e",
    fr: "Gynécologie-obstétrique",
    ar: "أمراض النساء والتوليد",
    en: "Gynecology & Obstetrics",
    icon: "🌸",
    desc_fr: "Spécialiste de la santé des femmes et de la maternité. Assure le suivi de grossesse, la contraception, le dépistage et les troubles du cycle.",
    desc_ar: "مختصة في صحة المرأة ومتابعة الحمل والولادة. تهتم بالفحوصات الدورية، وسائل تنظيم النسل، الكشف المبكر والاضطرابات الهرمونية.",
    desc_en: "Women's health and maternity physician. Oversees pregnancy, prenatal care, contraception, screenings, and menstrual health."
  },
  {
    key: "ortho",
    color: "#3b82f6",
    fr: "Orthopédie & Traumatologie",
    ar: "جراحة العظام والمفاصل",
    en: "Orthopedics",
    icon: "🦴",
    desc_fr: "Spécialiste des os, articulations, tendons et ligaments. Traite les fractures, entorses, arthrose du genou ou de hanche et douleurs du dos.",
    desc_ar: "مختص في الهيكل العظمي، المفاصل والأوتار. يعالج الكسور، التواء الكاحل، آلام العمود الفقري والغضاريف وخشونة المفاصل.",
    desc_en: "Bones, joints, and ligaments specialist. Treats fractures, sprains, knee/hip osteoarthritis, tendon injuries, and chronic back pain."
  },
  {
    key: "psychiatrie",
    color: "#6366f1",
    fr: "Psychiatrie",
    ar: "الطب النفسي والعقلي",
    en: "Psychiatry",
    icon: "🧘",
    desc_fr: "Médecin spécialiste du bien-être psychique et émotionnel. Accompagne l'anxiété, la dépression, le burn-out, les phobies et troubles du sommeil.",
    desc_ar: "طبيب مختص في الصحة النفسية والعاطفية. يساعد في علاج نوبات القلق والهلع، الاكتئاب، اضطرابات النوم والضغوط النفسية الحادة.",
    desc_en: "Mental and emotional health specialist. Helps manage severe anxiety, depression, burnout, phobias, and chronic sleep problems."
  },
  {
    key: "gastro",
    color: "#d97706",
    fr: "Gastro-entérologie",
    ar: "أمراض الجهاز الهضمي",
    en: "Gastroenterology",
    icon: "🍎",
    desc_fr: "Spécialiste de l'estomac, des intestins et du foie. Soigne les brûlures gastriques, ballonnements, colites, ulcères et troubles du transit.",
    desc_ar: "مختص في المعدة، القولون والكبد. يعالج حموضة وحرقة المعدة، متلازمة القولون العصبي، قرحة المعدة وصعوبات الهضم المزمنة.",
    desc_en: "Digestive system specialist (stomach, intestines, liver). Treats acid reflux, stomach ulcers, irritable bowel syndrome, and liver conditions."
  },
  {
    key: "pneumo",
    color: "#14b8a6",
    fr: "Pneumologie",
    ar: "أمراض الصدر والحساسية",
    en: "Pneumology",
    icon: "🫁",
    desc_fr: "Spécialiste des poumons et des voies respiratoires. Soigne l'asthme, toux persistante, bronchites chroniques et apnée du sommeil.",
    desc_ar: "مختص في الرئتين والجهاز التنفسي. يعالج الربو، السعال المستمر، حساسية الصدر، ضيق التنفس وانقطاع النفس أثناء النوم.",
    desc_en: "Lungs and respiratory care specialist. Treats asthma, persistent coughs, chronic bronchitis, breathing difficulties, and sleep apnea."
  },
  {
    key: "radio",
    color: "#64748b",
    fr: "Radiologie",
    ar: "الأشعة والتصوير الطبي",
    en: "Radiology",
    icon: "📷",
    desc_fr: "Médecin spécialiste de l'imagerie médicale. Réalise et interprète radiographies, échographies, scanners et IRM pour guider votre traitement.",
    desc_ar: "طبيب مختص في الفحوصات التصويرية. ينجز ويشخص الأشعة السينية، الإيكوغرافيا (الموجات فوق الصوتية)، السكانير والرنين المغناطيسي بدقة.",
    desc_en: "Medical imaging specialist. Performs and reads X-rays, ultrasounds, CT scans, and MRIs to guide accurate diagnoses and treatments."
  },
  {
    key: "endocrino",
    color: "#a855f7",
    fr: "Endocrinologie & Diabète",
    ar: "أمراض الغدد والسكري",
    en: "Endocrinology",
    icon: "🔬",
    desc_fr: "Spécialiste des hormones et des glandes. Assure le suivi du diabète, des dérèglements de la thyroïde et des variations brutales de poids.",
    desc_ar: "مختص في علاج الغدد الصماء والهرمونات. يتابع داء السكري، اضطرابات وخمول الغدة الدرقية واختلالات الوزن والهرمونات.",
    desc_en: "Hormone and glandular doctor. Manages diabetes, thyroid conditions, metabolic disorders, and unexplained weight shifts."
  },
  {
    key: "orl",
    color: "#e11d48",
    fr: "O.R.L",
    ar: "الأنف والأذن والحنجرة",
    en: "ENT (Ear, Nose, Throat)",
    icon: "👂",
    desc_fr: "Spécialiste de la gorge, du nez et des oreilles. Soigne sinusites chroniques, angines, ronflements, vertiges et pertes d'audition.",
    desc_ar: "مختص في مشاكل الأنف، الأذن، الحلق والحنجرة. يعالج الجيوب الأنفية، التهاب اللوزتين، الشخير، الدوار وطنين وضعف السمع.",
    desc_en: "Ear, Nose, and Throat specialist. Treats chronic sinus infections, tonsillitis, ear infections, hearing loss, vertigo, and snoring."
  },
  {
    key: "clinics",
    color: "#6366f1",
    fr: "Cliniques & Centres",
    ar: "العيادات والمراكز الطبية",
    en: "Clinics & Centers",
    icon: "🏥",
    desc_fr: "Structures de soins complètes regroupant plusieurs spécialités, urgences médicales, laboratoires d'analyses et consultations spécialisées.",
    desc_ar: "مؤسسات صحية متكاملة تضم استشارات في تخصصات متعددة، خدمات طوارئ، تحاليل مخبرية وفحوصات شاملة في مكان واحد.",
    desc_en: "Multi-specialty medical centers offering integrated consultations, emergency care, laboratory diagnostics, and patient services."
  }
];

const UserGuide = ({ navigate }) => {
  const { t, i18n } = useTranslation();

  const getInitialStep = () => {
    try {
      const hash = window.location.hash || "";
      if (hash.includes("step=search") || hash.includes("step=1")) return 1;
      if (hash.includes("step=booking") || hash.includes("step=2")) return 2;
      if (hash.includes("step=management") || hash.includes("step=3")) return 3;
      if (hash.includes("step=messaging") || hash.includes("step=4")) return 4;
    } catch (_) {}
    return 0;
  };

  const [activeStep, setActiveStep] = useState(getInitialStep);
  const [selectedSpecialtyKey, setSelectedSpecialtyKey] = useState("cardio");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const baseUrl = (import.meta.env.BASE_URL || "./").replace(/\/+$/, "") + "/";

  const steps = [
    {
      id: "intro",
      title: t("guide_intro_title"),
      subtitle: t("guide_intro_subtitle"),
      icon: <Smartphone size={32} />,
      image: `${baseUrl}guide/intro.png`,
      content: t("guide_intro_content", { returnObjects: true }) || [],
      tip: t("guide_intro_tip")
    },
    {
      id: "search",
      title: t("guide_search_title"),
      subtitle: t("guide_search_subtitle"),
      icon: <Search size={32} />,
      image: `${baseUrl}guide/search.png`,
      content: t("guide_search_content", { returnObjects: true }) || [],
      tip: t("guide_search_tip")
    },
    {
      id: "booking",
      title: t("guide_booking_title"),
      subtitle: t("guide_booking_subtitle"),
      icon: <Calendar size={32} />,
      image: `${baseUrl}guide/booking.png`,
      content: t("guide_booking_content", { returnObjects: true }) || [],
      tip: t("guide_booking_tip")
    },
    {
      id: "management",
      title: t("guide_mgmt_title"),
      subtitle: t("guide_mgmt_subtitle"),
      icon: <Clock size={32} />,
      image: `${baseUrl}guide/booking.png`, 
      content: t("guide_mgmt_content", { returnObjects: true }) || [],
      tip: t("guide_mgmt_tip")
    },
    {
      id: "messaging",
      title: t("guide_chat_title"),
      subtitle: t("guide_chat_subtitle"),
      icon: <MessageSquare size={32} />,
      image: `${baseUrl}guide/chat.png`,
      content: t("guide_chat_content", { returnObjects: true }) || [],
      tip: t("guide_chat_tip")
    }
  ];

  const nextStep = () => setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  const prevStep = () => setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));

  // Handle RTL for Arabic
  const isRTL = i18n.language === 'ar';
  const activeSpecialtyItem = SPECIALTY_GUIDE_ITEMS.find(s => s.key === selectedSpecialtyKey) || SPECIALTY_GUIDE_ITEMS[0];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{
      maxWidth: 1200,
      width: "100%",
      margin: isMobile ? "10px auto 30px" : "20px auto 50px",
      padding: isMobile ? "0 16px" : "0 24px",
      boxSizing: "border-box",
      minHeight: isMobile ? "auto" : "60vh",
      display: "flex",
      flexDirection: "column",
      gap: isMobile ? 14 : 22,
      fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <h1 style={{ 
          fontSize: isMobile ? 20 : 26, 
          fontWeight: 900, 
          color: "var(--text-main)",
          marginBottom: 4,
          lineHeight: 1.1
        }}>
          {t("guide_header_title")} <span style={{ color: "var(--brand)" }}>TABIBI</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: isMobile ? 13 : 15, maxWidth: 600, margin: "0 auto", lineHeight: 1.4 }}>
          {t("guide_header_subtitle")}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        background: "var(--card-bg)",
        padding: isMobile ? "8px" : "12px 20px",
        borderRadius: 16,
        boxShadow: "var(--shadow)",
        position: "relative",
        overflow: "hidden"
      }}>
        {steps.map((s, idx) => (
          <div 
            key={s.id} 
            onClick={() => setActiveStep(idx)}
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: 4,
              cursor: "pointer",
              zIndex: 2,
              flex: 1
            }}
          >
            <div style={{ 
              width: isMobile ? 32 : 40, 
              height: isMobile ? 32 : 40, 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              background: idx <= activeStep ? "#0e7490" : "var(--card-bg)", // Solid background
              border: `2px solid ${idx <= activeStep ? "#0e7490" : "var(--border)"}`,
              color: idx <= activeStep ? "#fff" : "var(--brand)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: idx === activeStep ? "scale(1.15)" : "scale(1)",
              boxShadow: idx === activeStep ? "0 8px 20px rgba(0,146,162,0.3)" : "none",
              fontSize: isMobile ? 14 : 16,
              fontWeight: 800
            }}>
              {idx < activeStep ? <Check size={isMobile ? 18 : 20} strokeWidth={3} /> : (idx + 1)}
            </div>
            {!isMobile && (
              <span style={{ 
                fontSize: 11, 
                fontWeight: 700, 
                color: idx === activeStep ? "var(--brand)" : "var(--text-muted)",
                textAlign: "center"
              }}>
                {s.title.split(" ")[0]}
              </span>
            )}
          </div>
        ))}
        {/* Connecting line */}
        <div style={{ 
          position: "absolute", 
          top: isMobile ? 24 : 32, 
          left: "10%", 
          right: "10%", 
          height: 4, 
          marginTop: -2, 
          background: "var(--border)", 
          zIndex: 1 
        }} />
        <div style={{ 
          position: "absolute", 
          top: isMobile ? 24 : 32, 
          [isRTL ? 'right' : 'left']: "10%", 
          width: `${(activeStep / (steps.length - 1)) * 80}%`, 
          height: 4, 
          marginTop: -2, 
          background: "#0e7490", 
          zIndex: 1,
          transition: "width 0.4s ease" 
        }} />
      </div>

      {/* Main Content */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 20 : 28,
        alignItems: "center",
        background: "var(--card-bg)",
        border: "1px solid #0891b2",
        padding: isMobile ? "16px 14px" : "24px 28px",
        borderRadius: 20,
        boxShadow: "var(--shadow-lg)",
        textAlign: isRTL ? "right" : "left"
      }}>
        {/* Text Area */}
        <div style={{ 
          animation: "fadeIn 0.5s ease-out"
        }} key={activeStep}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ 
              padding: isMobile ? 10 : 14, 
              background: "var(--brand-light)", 
              borderRadius: 16, 
              color: "var(--brand)" 
            }}>
              {React.cloneElement(steps[activeStep].icon, { size: isMobile ? 24 : 32 })}
            </div>
            <div>
              <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                {steps[activeStep].title}
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: isMobile ? 12 : 14, marginTop: 2, fontWeight: 600 }}>
                {steps[activeStep].subtitle}
              </p>
            </div>
          </div>

          <ul style={{ 
            listStyle: "none", 
            padding: 0, 
            display: "flex", 
            flexDirection: "column", 
            gap: 10,
            marginBottom: 20
          }}>
            {Array.isArray(steps[activeStep].content) && steps[activeStep].content.map((item, i) => (
              <li key={i} style={{ 
                display: "flex", 
                gap: 14, 
                alignItems: "flex-start",
                background: "var(--bg)",
                padding: "10px 14px",
                borderRadius: 14,
                boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
                transition: "all 0.2s",
                cursor: "default",
                border: "1px solid #0891b2",
                flexDirection: "row"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = isRTL ? "translateX(-10px)" : "translateX(10px)";
                e.currentTarget.style.borderColor = "var(--brand-light)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.borderColor = "#0891b2";
              }}
              >
                <div style={{ 
                  marginTop: 2,
                  width: 24, 
                  height: 24, 
                  borderRadius: "8px", 
                  background: "var(--brand)", 
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                  flexShrink: 0
                }}>{i + 1}</div>
                <span style={{ fontSize: isMobile ? 13 : 14, color: "var(--text-main)", fontWeight: 700, lineHeight: 1.5, flex: 1 }}>{item}</span>
              </li>
            ))}
          </ul>

          <div style={{ 
            background: "var(--brand-light)", 
            padding: "12px 16px", 
            borderRadius: 14,
            border: "1.5px dashed var(--brand)",
            display: "flex",
            gap: 10,
            alignItems: "center",
            boxShadow: "var(--shadow)",
            flexDirection: "row"
          }}>
            <div style={{ background: "var(--card-bg)", padding: 6, borderRadius: "50%", display: "flex" }}>
              <Info size={20} color="var(--brand)" />
            </div>
            <p style={{ margin: 0, color: "var(--text-main)", fontSize: 13, fontWeight: 800, lineHeight: 1.4, flex: 1 }}>
              {steps[activeStep].tip}
            </p>
          </div>
        </div>

        {/* Visual Area */}
        <div style={{ 
          position: "relative",
          display: "flex",
          justifyContent: "center",
          animation: "fadeIn 0.5s ease-out",
          perspective: 1000
        }} key={`img-${activeStep}`}>
          <div style={{
            position: "absolute",
            width: "120%",
            height: "120%",
            background: "radial-gradient(circle, var(--brand) 0%, transparent 70%)",
            opacity: 0.1,
            zIndex: 0,
            pointerEvents: "none"
          }} />
          
          <div style={{
             position: "relative",
             zIndex: 1,
             padding: 10,
             background: "var(--brand-light)",
             borderRadius: 48,
             backdropFilter: "blur(10px)",
             border: "1px solid #0891b2",
             boxShadow: "var(--shadow-lg)",
             transform: isMobile ? "none" : (isRTL ? "rotateY(10deg) rotateX(5deg)" : "rotateY(-10deg) rotateX(5deg)"),
             transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "rotateY(0deg) rotateX(0deg) scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = isMobile ? "none" : (isRTL ? "rotateY(10deg) rotateX(5deg)" : "rotateY(-10deg) rotateX(5deg)")}
          >
            <img 
              src={steps[activeStep].image} 
              alt={steps[activeStep].title}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = "1";
                  target.src = `./guide/${steps[activeStep].image.split("/").pop()}`;
                } else if (target.dataset.triedFallback === "1") {
                  target.dataset.triedFallback = "2";
                  target.src = `/guide/${steps[activeStep].image.split("/").pop()}`;
                }
              }}
              style={{ 
                width: "100%", 
                maxWidth: isMobile ? 180 : 220, 
                borderRadius: 24, 
                display: "block"
              }}
            />
          </div>

          {!isMobile && (
             <div style={{
                position: "absolute",
                bottom: 20,
                [isRTL ? 'left' : 'right']: -20,
                background: "var(--card-bg)",
                padding: "12px 20px",
                borderRadius: 16,
                boxShadow: "var(--shadow-lg)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                zIndex: 2,
                animation: "float 3s infinite ease-in-out",
                flexDirection: "row"
             }}>
                <CheckCircle size={20} color="var(--brand)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)" }}>{t("guide_step_verified", { num: activeStep + 1 })}</span>
             </div>
          )}
        </div>

        {/* ── SPECIALTY COLOR GUIDE (Step 2 Only) ── */}
        {steps[activeStep].id === "search" && (
          <div style={{
            gridColumn: isMobile ? "1" : "1 / -1",
            marginTop: 8,
            paddingTop: 20,
            borderTop: "1.5px dashed var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}>
            {/* Header & Quick Action */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #0891b2, #0e7490)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(8, 145, 178, 0.3)"
                }}>
                  <Palette size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: isMobile ? 15 : 17, fontWeight: 900, color: "var(--text-main)" }}>
                    {t("guide_specialty_colors_title")}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                    {t("guide_specialty_colors_desc")}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => navigate ? navigate("/search") : (window.location.hash = "#/search")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 10,
                    background: "var(--brand-light)",
                    border: "1.5px solid var(--brand)",
                    color: "var(--brand)",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(8, 145, 178, 0.25)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span>{t("guide_specialty_open_search")}</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>
              {t("guide_specialty_click_hint")}
            </div>

            {/* Specialties Grid (16 specialties) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
              gap: 8
            }}>
              {SPECIALTY_GUIDE_ITEMS.map((item) => {
                const isSelected = selectedSpecialtyKey === item.key;
                const name = isRTL ? item.ar : (i18n.language === 'en' ? item.en : item.fr);
                return (
                  <div
                    key={item.key}
                    onClick={() => setSelectedSpecialtyKey(item.key)}
                    style={{
                      position: "relative",
                      background: isSelected ? `${item.color}15` : "var(--bg)",
                      borderRadius: 10,
                      padding: "8px 10px",
                      borderTop: `2.5px solid ${item.color}`,
                      borderRight: `1px solid ${isSelected ? item.color : "var(--border)"}`,
                      borderBottom: `1px solid ${isSelected ? item.color : "var(--border)"}`,
                      borderLeft: `1px solid ${isSelected ? item.color : "var(--border)"}`,
                      boxShadow: isSelected ? `0 6px 14px ${item.color}30` : "0 2px 6px rgba(0,0,0,0.02)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isSelected ? "scale(1.02)" : "scale(1)"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                      e.currentTarget.style.boxShadow = `0 6px 14px ${item.color}25`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = isSelected ? "scale(1.02)" : "scale(1)";
                      e.currentTarget.style.boxShadow = isSelected ? `0 6px 14px ${item.color}30` : "0 2px 6px rgba(0,0,0,0.02)";
                    }}
                  >
                    <span style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: item.color,
                      boxShadow: `0 0 7px ${item.color}`,
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: isSelected ? 900 : 700,
                      color: isSelected ? item.color : "var(--text-main)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1
                    }} title={name}>
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Interactive Preview of What the Specialty Does */}
            {activeSpecialtyItem && (
              <div style={{
                background: "var(--bg)",
                border: `1.5px solid ${activeSpecialtyItem.color}45`,
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                boxShadow: `0 6px 20px ${activeSpecialtyItem.color}15`,
                transition: "all 0.3s ease"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "var(--text-main)" }}>
                      {activeSpecialtyItem.icon} {isRTL ? activeSpecialtyItem.ar : (i18n.language === 'en' ? activeSpecialtyItem.en : activeSpecialtyItem.fr)}
                    </span>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 10,
                      background: `${activeSpecialtyItem.color}18`,
                      color: activeSpecialtyItem.color,
                      border: `1px solid ${activeSpecialtyItem.color}35`
                    }}>
                      {isRTL ? "ماذا يعالج هذا التخصص؟" : (i18n.language === 'en' ? "What does this doctor treat?" : "Que soigne ce spécialiste ?")}
                    </span>
                  </div>

                  {/* Clear human explanation (max 2 lines) */}
                  <p style={{ 
                    margin: "4px 0 8px", 
                    fontSize: 13, 
                    color: "var(--text-main)", 
                    lineHeight: 1.6, 
                    fontWeight: 600,
                    maxWidth: 540
                  }}>
                    {isRTL 
                      ? activeSpecialtyItem.desc_ar 
                      : (i18n.language === 'en' ? activeSpecialtyItem.desc_en : activeSpecialtyItem.desc_fr)}
                  </p>

                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11.5,
                    color: "var(--brand)",
                    fontWeight: 700
                  }}>
                    <span>{isRTL 
                      ? "💡 علامة بصرية: يتميز هذا التخصص بهذا اللون لمساعدتك في تمييزه بلمحة سريعة أثناء البحث." 
                      : (i18n.language === 'en' 
                          ? "💡 Visual cue: this specialty uses this color to help you spot doctors instantly in search." 
                          : "💡 Repère visuel : cette spécialité utilise cette couleur pour vous repérer en un clin d'œil en recherche.")}</span>
                  </div>
                </div>

                {/* Simulated Mini Card */}
                <div style={{
                  width: isMobile ? "100%" : 230,
                  maxWidth: "100%",
                  background: "var(--card-bg)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  borderLeft: isRTL ? "none" : `3.5px solid ${activeSpecialtyItem.color}`,
                  borderRight: isRTL ? `3.5px solid ${activeSpecialtyItem.color}` : "none",
                  boxShadow: `0 6px 18px ${activeSpecialtyItem.color}25`,
                  overflow: "hidden",
                  flexShrink: 0
                }}>
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: `${activeSpecialtyItem.color}20`,
                        color: activeSpecialtyItem.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 900
                      }}>
                        {activeSpecialtyItem.icon}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t("guide_specialty_sample_doctor")}
                        </div>
                        <div style={{ fontSize: 9.5, color: "var(--text-muted)" }}>
                          {t("guide_specialty_sample_clinic")}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      display: "inline-block",
                      fontSize: 9.5,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 5,
                      background: `${activeSpecialtyItem.color}15`,
                      color: activeSpecialtyItem.color,
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {isRTL ? activeSpecialtyItem.ar : (i18n.language === 'en' ? activeSpecialtyItem.en : activeSpecialtyItem.fr)}
                    </span>
                  </div>

                  {/* Bottom Panel with Take Appointment button */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--card-bg)",
                    padding: "6px 10px",
                    borderTop: `2px solid ${activeSpecialtyItem.color}`,
                    fontSize: 10
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ color: activeSpecialtyItem.color, fontSize: 11 }}>★★★★★</span>
                      <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: 9.5 }}>(18)</span>
                    </div>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      color: "#fff",
                      background: activeSpecialtyItem.color,
                      padding: "2px 7px",
                      borderRadius: 4,
                      display: "inline-flex",
                      alignItems: "center"
                    }}>
                      {t("guide_specialty_badge_label")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginTop: 5,
        padding: "15px 0",
        borderTop: "1.5px solid var(--border)",
        opacity: 0.9,
        flexDirection: "row"
      }}>
        <button 
          onClick={prevStep}
          disabled={activeStep === 0}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 10,
            padding: isMobile ? "10px 16px" : "12px 24px",
            borderRadius: 16,
            border: "2px solid #0891b2",
            background: "var(--card-bg)",
            color: activeStep === 0 ? "var(--text-muted)" : "var(--text-main)",
            fontWeight: 800,
            fontSize: isMobile ? 14 : 16,
            cursor: activeStep === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow: activeStep === 0 ? "none" : "var(--shadow)",
            flexDirection: "row"
          }}
          onMouseEnter={e => { if(activeStep > 0) e.currentTarget.style.background = "var(--brand-light)"; }}
          onMouseLeave={e => { if(activeStep > 0) e.currentTarget.style.background = "var(--card-bg)"; }}
        >
          {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />} {isMobile ? "" : t("guide_prev")}
        </button>

        {activeStep === steps.length - 1 ? (
          <button 
            onClick={() => navigate("/")}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12,
              padding: isMobile ? "10px 20px" : "12px 28px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, var(--brand), var(--brand-dark))",
              color: "#fff",
              fontWeight: 900,
              fontSize: isMobile ? 14 : 16,
              cursor: "pointer",
              boxShadow: "0 12px 24px rgba(0,146,162,0.35)",
              transition: "all 0.3s",
              letterSpacing: isRTL ? 0 : 0.5,
              flexDirection: "row"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            {t("guide_finish")} <Play size={20} fill="#fff" style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
          </button>
        ) : (
          <button 
            onClick={nextStep}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 10,
              padding: isMobile ? "10px 20px" : "12px 28px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, var(--brand), var(--brand-dark))",
              color: "#fff",
              fontWeight: 900,
              fontSize: isMobile ? 14 : 16,
              cursor: "pointer",
              boxShadow: "0 12px 24px rgba(0,146,162,0.35)",
              transition: "all 0.3s",
              flexDirection: "row"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            {t("guide_next")} {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default UserGuide;
