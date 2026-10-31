// frontend/src/data/helpCenterData.js
// Données complètes et structurées du Centre d'aide TABIBI en 3 langues (FR, AR, EN)
// Basé exclusivement sur les fonctionnalités réelles de la plateforme web patient.

export const HELP_CATEGORIES = [
  {
    id: "decouvrir-tabibi",
    icon: "Compass",
    color: "#0891b2",
    titles: {
      fr: "Découvrir TABIBI",
      ar: "اكتشف منصة طبيبي",
      en: "Discover TABIBI"
    },
    descriptions: {
      fr: "Comprendre le fonctionnement global de TABIBI, la prise de rendez-vous et les services offerts aux patients.",
      ar: "تعرف على المنصة الطبية الرائدة في الجزائر، وكيف تسهل عليك حجز المواعيد والعثور على الأطباء مجاناً.",
      en: "Learn how TABIBI works, how to book appointments, and explore services offered to patients."
    }
  },
  {
    id: "mon-compte",
    icon: "User",
    color: "#2563eb",
    titles: {
      fr: "Mon compte",
      ar: "حسابي وإعداداتي",
      en: "My Account"
    },
    descriptions: {
      fr: "Créer un compte, se connecter, gérer son profil, ses proches et récupérer son mot de passe.",
      ar: "إنشاء حسابك، تسجيل الدخول، استعادة كلمة المرور، وإدارة أفراد العائلة لحجز المواعيد لهم.",
      en: "Create an account, log in, manage your profile, add family members, and reset your password."
    }
  },
  {
    id: "trouver-un-medecin",
    icon: "Search",
    color: "#0d9488",
    titles: {
      fr: "Trouver un médecin",
      ar: "البحث عن طبيب أو عيادة",
      en: "Find a Doctor"
    },
    descriptions: {
      fr: "Rechercher par spécialité, par wilaya (58 wilayas) et par commune (1541 baladiyas) en Algérie.",
      ar: "ابحث بدقة عبر 28 تخصصاً طبياً، وجميع الولايات الـ 58 والبلديات الـ 1541، واطلع على الملفات والتقييمات.",
      en: "Search by specialty, Algerian provinces (58 wilayas), and municipalities (1541 baladiyas)."
    }
  },
  {
    id: "prendre-un-rendez-vous",
    icon: "Calendar",
    color: "#059669",
    titles: {
      fr: "Prendre un rendez-vous",
      ar: "حجز موعد طبي",
      en: "Book an Appointment"
    },
    descriptions: {
      fr: "Choisir un médecin, comprendre les créneaux horaires ou la file d'attente, et valider sa réservation.",
      ar: "اختيار الطبيب المناسب، فهم نظام المواعيد المحددة أو نظام الدور والتذاكر، وتأكيد الحجز فوراً.",
      en: "Choose a doctor, understand exact time slots vs queue number systems, and confirm your booking."
    }
  },
  {
    id: "gerer-mes-rendez-vous",
    icon: "Clock",
    color: "#d97706",
    titles: {
      fr: "Gérer mes rendez-vous",
      ar: "إدارة مواعيدي",
      en: "Manage Appointments"
    },
    descriptions: {
      fr: "Retrouver l'historique de ses rendez-vous, consulter les détails d'accès et annuler si nécessaire.",
      ar: "متابعة المواعيد القادمة والسابقة، معرفة حالة الموعد، وإلغاء الحجز في حال وجود أي طارئ.",
      en: "View upcoming and past appointments, check clinic details, and cancel bookings when necessary."
    }
  },
  {
    id: "notifications",
    icon: "Bell",
    color: "#7c3aed",
    titles: {
      fr: "Notifications & Alertes",
      ar: "الإشعارات والتنبيهات",
      en: "Notifications & Alerts"
    },
    descriptions: {
      fr: "Comprendre les notifications de confirmation, les rappels et les messages de suivi.",
      ar: "الاطلاع على تنبيهات تأكيد الحجز، التذكير بموعد الفحص، والتحديثات الواردة من العيادة أو المنصة.",
      en: "Understand confirmation alerts, appointment reminders, and platform updates."
    }
  },
  {
    id: "confidentialite-et-securite",
    icon: "ShieldCheck",
    color: "#dc2626",
    titles: {
      fr: "Confidentialité & Sécurité",
      ar: "الخصوصية وحماية البيانات",
      en: "Privacy & Security"
    },
    descriptions: {
      fr: "Protection des données de santé, conformité avec la loi algérienne 18-07, téléchargement et droits.",
      ar: "حماية بياناتك الصحية وفق القانون الجزائري 18-07، إدارة موافقاتك، وتحميل أو حذف بياناتك بأمان.",
      en: "Health data protection, compliance with Algerian Law 18-07, consent management, and data rights."
    }
  },
  {
    id: "assistance",
    icon: "HelpCircle",
    color: "#4f46e5",
    titles: {
      fr: "Assistance & Support",
      ar: "الدعم والمساعدة",
      en: "Help & Support"
    },
    descriptions: {
      fr: "Soumettre une réclamation administrative, signaler un problème technique et contacter l'équipe TABIBI.",
      ar: "تقديم طلب دعم فني أو شكوى إدارية للإدارة الرسمية، والتواصل مع فريق طبيبي لحل مشكلاتك.",
      en: "Submit administrative tickets, report technical difficulties, and contact the TABIBI team."
    }
  }
];

export const HELP_ARTICLES = [
  // ── 1. DÉCOUVRIR TABIBI ─────────────────────────────────────
  {
    slug: "presentation-de-tabibi",
    categoryId: "decouvrir-tabibi",
    isPopular: true,
    readTime: "3 min",
    titles: {
      fr: "Présentation de TABIBI : la plateforme santé en Algérie",
      ar: "مقدمة عن منصة طبيبي: بوابتك الصحية في الجزائر",
      en: "Introducing TABIBI: Your Healthcare Platform in Algeria"
    },
    summaries: {
      fr: "Découvrez la mission de TABIBI, ses avantages gratuits pour les patients et son réseau médical à travers tout le territoire national.",
      ar: "اكتشف رؤية منصة طبيبي، والخدمات المجانية المتاحة للمرضى للربط المباشر مع الأطباء والعيادات عبر كامل التراب الوطني.",
      en: "Discover TABIBI's mission, free benefits for patients, and nationwide medical network across Algeria."
    },
    content: {
      fr: {
        intro: "TABIBI est la plateforme numérique de référence en Algérie conçue pour rapprocher les patients des professionnels de santé. Elle permet de trouver un médecin ou une clinique qualifiée et de planifier une consultation en quelques clics.",
        steps: [
          {
            title: "Un service 100% gratuit pour les patients",
            desc: "La recherche de praticiens, la consultation des profils et la prise de rendez-vous en ligne sont totalement gratuites pour tous les patients."
          },
          {
            title: "Couverture nationale complète",
            desc: "Accédez à un annuaire certifié couvrant les 58 wilayas et plus de 1 500 communes d'Algérie, dans 28 spécialités médicales différentes."
          },
          {
            title: "Accessible 24h/24 et 7j/7",
            desc: "Consultez les disponibilités réelles des cabinets médicaux et prenez rendez-vous à tout moment, sans attendre les horaires d'ouverture du secrétariat."
          }
        ],
        tip: "Vous n'avez pas besoin de créer un compte pour consulter l'annuaire des médecins et les créneaux disponibles. Le compte n'est requis qu'au moment de confirmer votre rendez-vous.",
        warning: "TABIBI est une plateforme de prise de rendez-vous et d'information médicale. En cas d'urgence médicale vitale, veuillez composer immédiatement le 14 (Protection Civile) ou le 1021."
      },
      ar: {
        intro: "منصة طبيبي (Tabibi) هي المنصة الرقمية الرائدة في الجزائر لربط المرضى بالأطباء والعيادات الطبية المعتمدة. تهدف المنصة إلى تيسير الوصول إلى الرعاية الصحية وحجز المواعيد الطبية بسهولة تامة وبلا عناء التنقل والانتظار.",
        steps: [
          {
            title: "خدمة مجانية بالكامل للمرضى",
            desc: "البحث عن الأطباء، وتصفح العيادات، وحجز المواعيد عبر المنصة مجاني 100% لجميع المواطنين دون أي رسوم إضافية."
          },
          {
            title: "تغطية شاملة لكل ولايات الجزائر",
            desc: "دليل موثق يغطي 58 ولاية و1,541 بلدية جزائرية، مع أكثر من 28 تخصصاً طبياً معتمداً."
          },
          {
            title: "متاح 24 ساعة طوال أيام الأسبوع",
            desc: "يمكنك التحقق من أوقات دوام العيادات وحجز موعدك في أي وقت ليلاً أو نهاراً حتى في أوقات إغلاق سكرتارية العيادة."
          }
        ],
        tip: "لا تحتاج إلى تسجيل الدخول لتصفح الأطباء ومعرفة مواعيد عملهم ومواقع عياداتهم؛ التسجيل مطلوب فقط عند تأكيد حجز الموعد لحفظ بياناتك وتأكيد حضورك.",
        warning: "منصة طبيبي مخصصة للمواعيد الطبية المجدولة. في حالات الطوارئ الطبية والحرجة، يرجى الاتصال فوراً بالحماية المدنية (14) أو التوجه لأقرب مصلحة استعجالات."
      },
      en: {
        intro: "TABIBI is Algeria's leading digital health platform connecting patients with certified medical professionals. It allows you to find qualified doctors and clinics and book appointments effortlessly.",
        steps: [
          {
            title: "100% Free for patients",
            desc: "Searching for healthcare providers, viewing doctor profiles, and booking appointments online is completely free."
          },
          {
            title: "Comprehensive national coverage",
            desc: "Access verified doctors across all 58 Algerian provinces (wilayas) and 1,541 municipalities across 28 medical specialties."
          },
          {
            title: "Available 24/7",
            desc: "Browse doctor availability and schedule appointments at any time, even outside clinic operating hours."
          }
        ],
        tip: "You can browse doctors, specialties, and schedules without an account. An account is only required when finalizing your appointment.",
        warning: "TABIBI is designed for scheduled consultations. In case of an emergency, immediately dial 14 (Civil Protection) or visit the nearest emergency room."
      }
    }
  },
  {
    slug: "comment-fonctionne-la-plateforme",
    categoryId: "decouvrir-tabibi",
    isPopular: false,
    readTime: "4 min",
    titles: {
      fr: "Comment fonctionne la plateforme TABIBI ?",
      ar: "كيف تعمل المنصة؟ دليل خطوة بخطوة للمريض",
      en: "How does TABIBI work? A step-by-step patient guide"
    },
    summaries: {
      fr: "Comprenez les étapes clés : de la recherche d'un médecin jusqu'à votre consultation au cabinet médical.",
      ar: "تعرف على المراحل الأساسية من أول بحث عن الطبيب وحتى دخولك لعيادة الفحص الطبي.",
      en: "Understand the key stages from finding a physician to attending your clinic visit."
    },
    content: {
      fr: {
        intro: "Le parcours patient sur TABIBI a été conçu pour être simple, clair et transparent, sans démarches complexes.",
        steps: [
          {
            title: "1. Rechercher",
            desc: "Renseignez le nom du médecin, sa spécialité ou votre localisation (Wilaya et Commune) pour afficher les praticiens disponibles."
          },
          {
            title: "2. Choisir la date et l'horaire",
            desc: "Consultez le calendrier du médecin et sélectionnez le créneau qui vous convient le mieux."
          },
          {
            title: "3. Confirmer pour soi ou un proche",
            desc: "Précisez si le rendez-vous est pour vous-même ou pour un membre de votre famille préalablement enregistré."
          },
          {
            title: "4. Se présenter au cabinet",
            desc: "Rendez-vous à l'adresse indiquée à l'heure convenue en mentionnant votre nom au secrétariat médical."
          }
        ],
        tip: "La plateforme synchronise les disponibilités avec le logiciel interne du médecin : le créneau que vous réservez est immédiatement réservé pour vous.",
        warning: "Pensez à annuler votre rendez-vous depuis votre espace personnel si vous avez un empêchement, afin de libérer la place pour un autre patient."
      },
      ar: {
        intro: "تم تصميم تجربة المريض في طبيبي لتكون سلسة وسريعة بدون أي تعقيد، وتتضمن 4 خطوات أساسية:",
        steps: [
          {
            title: "1. البحث عن الطبيب أو التخصص",
            desc: "حدد التخصص المطلوب، أو اسم الطبيب، أو اختر ولايتك وبلديتك لعرض الأطباء الأقرب إليك."
          },
          {
            title: "2. اختيار الموعد المناسب",
            desc: "تصفح الأيام المتاحة في جدول الطبيب واختر التوقيت أو رقم الدور الملائم لجدولك اليومي."
          },
          {
            title: "3. تأكيد الحجز (لك أو لأحد أفراد العائلة)",
            desc: "اختر ما إذا كان الحجز لشخصك أو لأحد أفراد أسرتك المسجلين بحسابك، وحدد سبب الزيارة إن أمكن."
          },
          {
            title: "4. الحضور إلى العيادة",
            desc: "توجه إلى عنوان العيادة في الوقت المحدد، واذكر اسمك لمكتب الاستقبال لتأكيد حضورك."
          }
        ],
        tip: "تتصل المنصة مباشرة بنظام عيادة الطبيب لضمان عدم حدوث أي تضارب في المواعيد بين المرضى في العيادة وحجوزات الإنترنت.",
        warning: "إذا طرأ ظرف طارئ يمنعك من الحضور، يرجى إلغاء الموعد عبر حسابك قبل موعده بوقت كافٍ لإتاحة الفرصة لمريض آخر يحتاج الكشف."
      },
      en: {
        intro: "The patient journey on TABIBI is simple, efficient, and transparent across 4 key steps:",
        steps: [
          {
            title: "1. Search for a provider",
            desc: "Specify the specialty, doctor's name, or your location (Wilaya and municipality) to view nearby options."
          },
          {
            title: "2. Choose a date and time",
            desc: "Browse the doctor's live schedule and select your preferred slot or queue number."
          },
          {
            title: "3. Confirm booking (Self or Family)",
            desc: "Indicate whether the appointment is for yourself or a registered dependent."
          },
          {
            title: "4. Visit the clinic",
            desc: "Arrive at the medical office address at the scheduled time and check in with the clinic receptionist."
          }
        ],
        tip: "Schedules update in real-time with the clinic's software, preventing double bookings.",
        warning: "If you cannot attend, please cancel your booking early to free the slot for another patient."
      }
    }
  },

  // ── 2. MON COMPTE ───────────────────────────────────────────
  {
    slug: "creer-un-compte",
    categoryId: "mon-compte",
    isPopular: true,
    readTime: "3 min",
    titles: {
      fr: "Créer un compte patient et valider son adresse email",
      ar: "كيفية إنشاء حساب مريض جديد وتأكيد البريد الإلكتروني",
      en: "Creating a Patient Account & Email Verification"
    },
    summaries: {
      fr: "Guide pour s'inscrire en quelques secondes et valider son compte avec le code de vérification reçu par email.",
      ar: "طريقة التسجيل السريع وتفعيل حسابك عبر رمز الأمان المرسل إلى بريدك الإلكتروني.",
      en: "Step-by-step registration guide and activating your account with an email verification code."
    },
    content: {
      fr: {
        intro: "L'inscription sur TABIBI est rapide et sécurisée. Elle vous permet de suivre tous vos rendez-vous médicaux depuis un tableau de bord unique.",
        steps: [
          {
            title: "1. Accéder au formulaire d'inscription",
            desc: "Cliquez sur le bouton « Inscription » en haut à droite du site."
          },
          {
            title: "2. Renseigner vos informations de base",
            desc: "Indiquez votre nom complet, un nom d'utilisateur unique, votre numéro de téléphone et votre adresse email."
          },
          {
            title: "3. Définir un mot de passe sécurisé",
            desc: "Choisissez un mot de passe robuste comprenant au moins 8 caractères, des chiffres et des lettres."
          },
          {
            title: "4. Valider le code de sécurité (OTP)",
            desc: "Un code de vérification à chiffres vous est envoyé par email. Saisissez-le pour activer définitivement votre compte."
          }
        ],
        tip: "Si vous ne recevez pas l'email de confirmation dans les 2 minutes, vérifiez votre dossier de courriers indésirables (Spam).",
        warning: "Assurez-vous de renseigner un numéro de téléphone réel et accessible : le secrétariat médical peut vous appeler en cas d'imprévu du médecin."
      },
      ar: {
        intro: "يمنحك حساب المريض في طبيبي سجلاً رقمياً لكافة مواعيدك الطبية وسهولة تامة في الحجز وإلغاء المواعيد.",
        steps: [
          {
            title: "1. فتح صفحة التسجيل",
            desc: "اضغط على زر «تسجيل جديد» في أعلى الشاشة الرئيسية."
          },
          {
            title: "2. إدخال المعلومات الشخصية",
            desc: "أدخل اسمك الكامل، اسم مستخدم تختاره، رقم هاتفك الجوال، وبريدك الإلكتروني."
          },
          {
            title: "3. اختيار كلمة مرور قوية",
            desc: "اختر كلمة مرور آمنة تحتوي على حروف وأرقام لحماية خصوصية بياناتك الصحية."
          },
          {
            title: "4. إدخال رمز التحقق (OTP)",
            desc: "ستصلك رسالة عبر بريدك الإلكتروني تحتوي رمز تحقق مكون من أرقام؛ أدخله لتفعيل حسابك فوراً."
          }
        ],
        tip: "إذا لم يصلك رمز التأكيد في بريدك الوارد خلال دقيقة، تفقّد مجلد الرسائل غير المرغوب فيها (Spam / Junk).",
        warning: "يرجى إدخال رقم هاتف حقيقي ومباشر؛ قد تحتاج عيادة الطبيب للاتصال بك في حال حدوث طارئ أو تعديل وقت الدوام."
      },
      en: {
        intro: "Creating an account gives you a secure dashboard to manage consultations, family bookings, and appointments.",
        steps: [
          {
            title: "1. Open the registration page",
            desc: "Click 'Register' at the top right of the navigation bar."
          },
          {
            title: "2. Fill in your information",
            desc: "Enter your full name, username, mobile phone number, and email address."
          },
          {
            title: "3. Set a secure password",
            desc: "Create a password of at least 8 characters combining letters and numbers."
          },
          {
            title: "4. Enter the verification code (OTP)",
            desc: "Check your email for the activation code and submit it to finalize your registration."
          }
        ],
        tip: "If the verification email does not appear in your inbox within 2 minutes, check your spam folder.",
        warning: "Always provide an active mobile phone number so the doctor's office can reach you if needed."
      }
    }
  },
  {
    slug: "modifier-ses-informations-personnelles",
    categoryId: "mon-compte",
    isPopular: false,
    readTime: "3 min",
    titles: {
      fr: "Gérer son profil et ajouter des membres de sa famille",
      ar: "تعديل الملف الشخصي وإضافة أفراد العائلة للحجز لهم",
      en: "Profile Settings & Adding Family Members"
    },
    summaries: {
      fr: "Mettez à jour vos coordonnées et gérez la liste de vos enfants ou parents pour réserver des rendez-vous en leur nom.",
      ar: "طريقة تحديث رقم الهاتف والمعلومات، وإضافة الأبناء أو الوالدين لحجز المواعيد لهم بسهولة من نفس الحساب.",
      en: "Update contact details and manage family dependents to book appointments on their behalf."
    },
    content: {
      fr: {
        intro: "Depuis votre espace profil, vous pouvez à tout moment actualiser vos coordonnées et gérer la liste de vos proches (enfants, parents, conjoint).",
        steps: [
          {
            title: "1. Ouvrir votre profil",
            desc: "Cliquez sur votre nom ou votre avatar en haut à droite, puis sélectionnez « Profil »."
          },
          {
            title: "2. Mettre à jour vos coordonnées",
            desc: "Modifiez votre nom, votre numéro de téléphone ou vos préférences, puis cliquez sur « Enregistrer »."
          },
          {
            title: "3. Ajouter un membre de votre famille",
            desc: "Accédez à la section « Gestion de la famille », cliquez sur « Ajouter un membre », indiquez son nom complet, sa date de naissance et son genre."
          }
        ],
        tip: "Lors de la prise d'un rendez-vous, vous pourrez simplement sélectionner le proche concerné dans la liste déroulante sans avoir à créer un second compte.",
        warning: "Vérifiez que la date de naissance de votre proche est exacte, car certaines spécialités comme la pédiatrie en tiennent compte."
      },
      ar: {
        intro: "يمكنك من خلال صفحة الملف الشخصي تحديث بياناتك وإضافة أفراد أسرتك لحجز مواعيد لهم بسهولة وبدون الحاجة لإنشاء حسابات منفصلة.",
        steps: [
          {
            title: "1. الدخول إلى الملف الشخصي",
            desc: "اضغط على اسمك في أعلى القائمة ثم اختر «الملف الشخصي»."
          },
          {
            title: "2. تحديث المعلومات الشخصية",
            desc: "عدل الاسم، الهاتف أو البريد الإلكتروني ثم اضغط زر «حفظ التغييرات»."
          },
          {
            title: "3. إضافة فرد من العائلة (أبناء، والدين، زوج)",
            desc: "توجه إلى قسم «إدارة أفراد العائلة»، اضغط «إضافة فرد جديد»، وأدخل اسمه الكامل، تاريخ ميلاده، وجنسه."
          }
        ],
        tip: "عند حجز أي موعد لاحقاً، ستظهر لك قائمة منسدلة تسألك: «الموعد مخصص لمن؟» لتختار نفسك أو أي فرد من عائلتك بنقرة واحدة.",
        warning: "احرص على كتابة الاسم المطابق لدفتر العلاج أو بطاقة الشفاء الخاصة بالفرد لتسهيل الاستقبال في العيادة."
      },
      en: {
        intro: "Update your profile anytime and manage your dependents (children, parents, spouse) in one place.",
        steps: [
          {
            title: "1. Open your profile",
            desc: "Click your name or avatar at the top right and select 'Profile'."
          },
          {
            title: "2. Update details",
            desc: "Edit your phone number or information and save changes."
          },
          {
            title: "3. Add a family member",
            desc: "Navigate to 'Family Management', click 'Add Member', and provide their name, birthdate, and gender."
          }
        ],
        tip: "When booking an appointment, you can select which family member the visit is for.",
        warning: "Ensure the dependent's birthdate is accurate, particularly for pediatric care."
      }
    }
  },
  {
    slug: "recuperer-un-mot-de-passe-oublie",
    categoryId: "mon-compte",
    isPopular: false,
    readTime: "2 min",
    titles: {
      fr: "Récupérer un mot de passe oublié",
      ar: "استعادة كلمة المرور المنسية",
      en: "Resetting a Forgotten Password"
    },
    summaries: {
      fr: "Procédure sécurisée pour réinitialiser votre mot de passe en recevant un code de réinitialisation par email.",
      ar: "خطوات آمنة لإعادة تعيين كلمة المرور عبر استلام رمز الأمان في بريدك الإلكتروني.",
      en: "Secure steps to reset your password using an email verification code."
    },
    content: {
      fr: {
        intro: "Si vous avez oublié votre mot de passe, vous pouvez le réinitialiser en toute sécurité en quelques étapes.",
        steps: [
          {
            title: "1. Cliquer sur « Mot de passe oublié »",
            desc: "Sur la page de connexion, cliquez sur le lien sous les champs de saisie."
          },
          {
            title: "2. Renseigner votre adresse email",
            desc: "Indiquez l'adresse email associée à votre compte patient TABIBI."
          },
          {
            title: "3. Saisir le code et le nouveau mot de passe",
            desc: "Entrez le code reçu par email puis définissez votre nouveau mot de passe."
          }
        ],
        tip: "Le code de réinitialisation expire au bout de 15 minutes pour votre sécurité.",
        warning: "Ne partagez jamais vos codes de vérification par email ou SMS avec des tiers."
      },
      ar: {
        intro: "في حال نسيت كلمة المرور، يمكنك استعادتها فوراً وبأمان تام:",
        steps: [
          {
            title: "1. الضغط على «نسيت كلمة المرور»",
            desc: "من صفحة تسجيل الدخول، انقر على رابط استعادة كلمة المرور أسفل الحقول."
          },
          {
            title: "2. إدخال البريد الإلكتروني المسجل",
            desc: "اكتب عنوان بريدك الإلكتروني المسجل في حسابك للبحث عنه."
          },
          {
            title: "3. إدخال رمز التحقق واختيار كلمة مرور جديدة",
            desc: "أدخل الرمز المستلم في بريدك ثم اكتب كلمة المرور الجديدة وقم بتأكيدها."
          }
        ],
        tip: "صلاحية رمز الاستعادة محددة بـ 15 دقيقة فقط لضمان أمان حسابك.",
        warning: "لا تشارك أبداً رموز الأمان مع أي شخص يدعي أنه من فريق الدعم."
      },
      en: {
        intro: "If you forgot your password, easily reset it using your registered email address:",
        steps: [
          {
            title: "1. Click 'Forgot Password'",
            desc: "On the login screen, click the reset link under the credentials fields."
          },
          {
            title: "2. Enter your email",
            desc: "Provide the email address linked to your patient account."
          },
          {
            title: "3. Submit the code and set new password",
            desc: "Enter the code received and choose your new password."
          }
        ],
        tip: "The reset code is valid for 15 minutes for security reasons.",
        warning: "Never share verification codes with anyone."
      }
    }
  },

  // ── 3. TROUVER UN MÉDECIN ───────────────────────────────────
  {
    slug: "rechercher-un-medecin",
    categoryId: "trouver-un-medecin",
    isPopular: true,
    readTime: "3 min",
    titles: {
      fr: "Rechercher un médecin par spécialité, wilaya et commune",
      ar: "كيفية البحث عن طبيب حسب التخصص، الولاية والبلدية",
      en: "Searching Doctors by Specialty, Province & Municipality"
    },
    summaries: {
      fr: "Utilisez les filtres multicritères de TABIBI pour localiser les praticiens les plus proches de chez vous.",
      ar: "استخدم محرك بحث طبيبي الدقيق للفلترة حسب 28 تخصصاً و58 ولاية والبلديات المجاورة لك.",
      en: "Use multi-criteria filters to locate nearby healthcare professionals across Algeria."
    },
    content: {
      fr: {
        intro: "Le moteur de recherche de TABIBI vous permet d'accéder rapidement aux médecins selon vos critères géographiques et médicaux.",
        steps: [
          {
            title: "1. Utiliser la barre de recherche principale",
            desc: "Depuis la page d'accueil ou la page Recherche, saisissez le nom d'un médecin ou le nom d'une spécialité."
          },
          {
            title: "2. Filtrer par Wilaya et Commune (Baladiya)",
            desc: "Sélectionnez votre Wilaya parmi les 58 wilayas, puis affinez par votre commune pour voir les praticiens de proximité."
          },
          {
            title: "3. Filtrer par Spécialité médicale",
            desc: "Choisissez parmi les 28 spécialités disponibles (Médecine générale, Cardiologie, Pédiatrie, Dermatologie, Ophtalmologie...)."
          },
          {
            title: "4. Comparer les résultats",
            desc: "Chaque résultat affiche l'adresse du cabinet, les disponibilités prochaines, et les avis certifiés des patients."
          }
        ],
        tip: "Si vous ne trouvez pas de médecin dans votre commune, élargissez la recherche à l'ensemble de votre Wilaya.",
        warning: "Vérifiez toujours que la spécialité sélectionnée correspond bien à votre besoin de consultation."
      },
      ar: {
        intro: "يتيح لك محرك بحث طبيبي تصفية النتائج بدقة وسرعة للوصول إلى الطبيب المناسب قرب مقر سكنك:",
        steps: [
          {
            title: "1. البحث بالاسم أو التخصص",
            desc: "اكتب اسم الطبيب أو عيادته في شريط البحث، أو اختر التخصص المطلوب من القائمة."
          },
          {
            title: "2. الفلترة حسب الولاية والبلدية",
            desc: "حدد ولايتك من بين الـ 58 ولاية، ثم اختر بلديتك من بين البلديات الـ 1,541 لعرض الأقرب إليك أولاً."
          },
          {
            title: "3. اختيار التخصص الطبي",
            desc: "تصفح التخصصات المتاحة (طب عام، طب الأطفال، أمراض القلب، العيون، النساء والتوليد، جراحة الأسنان...)."
          },
          {
            title: "4. الاطلاع على بطاقة الطبيب",
            desc: "تعرض بطاقة كل طبيب عنوان العيادة، أقرب موعد متاح للحجز، وتقييمات المرضى الحقيقيين."
          }
        ],
        tip: "في حال لم تجد طبيباً في بلديتك مباشرة، وسّع نطاق البحث ليشمل كامل الولاية أو البلديات المحيطة.",
        warning: "تأكد من اختيار التخصص المناسب لحالتك لتوفير وقتك والحصول على الاستشارة الطبية الصحيحة."
      },
      en: {
        intro: "TABIBI's search engine helps you quickly locate doctors based on geographic and clinical criteria:",
        steps: [
          {
            title: "1. Use the search bar",
            desc: "Type the doctor's name, clinic name, or specialty into the main search box."
          },
          {
            title: "2. Filter by Wilaya and Municipality",
            desc: "Select your province (out of 58) and refine by your municipality (Baladiya)."
          },
          {
            title: "3. Select a medical specialty",
            desc: "Choose from 28 certified specialties (General Practice, Cardiology, Pediatrics, Dermatology, etc.)."
          },
          {
            title: "4. Review results",
            desc: "Compare clinic addresses, next available slots, and patient ratings."
          }
        ],
        tip: "If no doctor is found in your specific municipality, broaden your search to the entire Wilaya.",
        warning: "Ensure you select the right specialty for your symptoms to receive appropriate care."
      }
    }
  },
  {
    slug: "consulter-le-profil-dun-medecin",
    categoryId: "trouver-un-medecin",
    isPopular: false,
    readTime: "3 min",
    titles: {
      fr: "Consulter la fiche profil d'un médecin ou d'une clinique",
      ar: "الاطلاع على الملف التعريفي للطبيب أو العيادة",
      en: "Viewing a Doctor or Clinic Profile"
    },
    summaries: {
      fr: "Découvrez toutes les informations utiles : adresse, tarifs indicatifs, horaires de travail et avis des patients.",
      ar: "تعرف على تفاصيل العيادة، أوقات العمل، الخدمات المقدمة، وتقييمات المرضى السابقين.",
      en: "Discover key details including office address, working hours, and certified patient reviews."
    },
    content: {
      fr: {
        intro: "Chaque fiche praticien sur TABIBI fournit des détails complets et vérifiés pour vous aider à préparer votre visite médicale.",
        steps: [
          {
            title: "Informations professionnelles",
            desc: "Nom complet, spécialités pratiquées, diplômes et présentation du praticien."
          },
          {
            title: "Coordonnées et localisation",
            desc: "Adresse précise du cabinet ou de la clinique, avec indications d'accès."
          },
          {
            title: "Horaires et calendrier de réservation",
            desc: "Visualisation directe des jours d'ouverture et des créneaux disponibles pour réserver en ligne."
          },
          {
            title: "Avis vérifiés",
            desc: "Notes et commentaires laissés par des patients ayant réellement effectué une consultation chez ce médecin."
          }
        ],
        tip: "Vous pouvez cliquer sur le numéro de téléphone pour appeler le cabinet si vous avez une question spécifique sur les examens préliminaires.",
        warning: "Les tarifs mentionnés sont indicatifs et peuvent varier selon les actes complémentaires réalisés au cours de la consultation."
      },
      ar: {
        intro: "توفر لك صفحة كل طبيب في منصة طبيبي معلومات موثقة وشاملة لتجهيز زيارتك الطبية:",
        steps: [
          {
            title: "المعلومات المهنية والتخصص",
            desc: "الاسم الكامل، التخصصات الدقيقة، والخدمات الطبية التي يقدمها الطبيب."
          },
          {
            title: "العنوان وموقع العيادة",
            desc: "العنوان التفصيلي للعيادة أو المركز الطبي مع أرقام الاتصال المباشرة."
          },
          {
            title: "مواعيد العمل وجدول الحجز",
            desc: "عرض مباشر لأيام وساعات الدوام والمواعيد الشاغرة للحجز الفوري."
          },
          {
            title: "تقييمات المرضى المعتمدة",
            desc: "آراء وتقييمات المرضى الذين حضروا بالفعل كشوفات سابقة لدى هذا الطبيب."
          }
        ],
        tip: "يمكنك الضغط على رقم الهاتف للاتصال بالعيادة في حال كان لديك استفسار عن تحاليل أو فحوصات مطلوبة قبل الكشف.",
        warning: "أسعار الكشوفات المعروضة تقديرية وقد تختلف باختلاف الفحوصات الإضافية أو الإجراءات التي تتطلبها حالتك."
      },
      en: {
        intro: "Doctor profiles provide comprehensive, verified information to prepare your visit:",
        steps: [
          {
            title: "Professional credentials",
            desc: "Full name, medical specialties, and services provided."
          },
          {
            title: "Address & Location",
            desc: "Clear clinic address with phone contact options."
          },
          {
            title: "Operating hours & calendar",
            desc: "Interactive schedule showing available booking slots in real time."
          },
          {
            title: "Verified patient reviews",
            desc: "Ratings and feedback from patients who actually attended consultations."
          }
        ],
        tip: "You can click the clinic phone number to inquire about any necessary preparatory tests.",
        warning: "Listed consultation fees are indicative and may vary if additional procedures are performed."
      }
    }
  },

  // ── 4. PRENDRE UN RENDEZ-VOUS ───────────────────────────────
  {
    slug: "choisir-un-medecin-et-reserver",
    categoryId: "prendre-un-rendez-vous",
    isPopular: true,
    readTime: "4 min",
    titles: {
      fr: "Comment prendre un rendez-vous médical sur TABIBI ?",
      ar: "كيفية حجز موعد طبي خطوة بخطوة على طبيبي",
      en: "How to Book a Doctor's Appointment on TABIBI"
    },
    summaries: {
      fr: "Guide complet pour sélectionner une date, choisir un créneau ou un ticket de file d'attente, et finaliser la réservation.",
      ar: "دليل كامل لاختيار اليوم والتوقيت، وفهم نظام الحجز، وتأكيد موعدك واستلام وصل التأكيد.",
      en: "Complete guide to selecting a date, choosing a time slot or queue ticket, and confirming your booking."
    },
    content: {
      fr: {
        intro: "La prise de rendez-vous sur TABIBI ne prend que 2 minutes et ne nécessite aucun paiement en ligne.",
        steps: [
          {
            title: "1. Choisir le médecin et cliquer sur « Réserver »",
            desc: "Depuis la fiche du praticien, accédez à la section calendrier des rendez-vous."
          },
          {
            title: "2. Sélectionner le jour souhaité",
            desc: "Les dates en vert indiquent les jours d'ouverture où des créneaux sont disponibles."
          },
          {
            title: "3. Choisir le créneau horaire ou le ticket",
            desc: "Selon l'organisation du médecin, vous choisissez soit une heure précise (ex: 10h15), soit un numéro de ticket dans la file d'attente avec une heure estimée."
          },
          {
            title: "4. Indiquer le motif de consultation",
            desc: "Sélectionnez le motif (première consultation, contrôle, certificat médical, renouvellement...)."
          },
          {
            title: "5. Choisir le bénéficiaire et valider",
            desc: "Confirmez si le rendez-vous est pour vous ou pour l'un de vos proches (enfant, parent). Votre rendez-vous est validé immédiatement !"
          }
        ],
        tip: "Dès validation, vous recevez un récapitulatif avec l'adresse complète du médecin et un email de confirmation.",
        warning: "Aucun paiement en ligne n'est demandé par TABIBI : les honoraires médicaux se règlent directement sur place au cabinet du médecin."
      },
      ar: {
        intro: "حجز موعدك الطبي عبر منصة طبيبي يتم في أقل من دقيقتين وبدون أي دفع مسبق:",
        steps: [
          {
            title: "1. اختيار الطبيب والضغط على «حجز موعد»",
            desc: "من الملف الشخصي للطبيب، انقر على زر حجز موعد للانتقال لجدول الأوقات."
          },
          {
            title: "2. اختيار اليوم المناسب",
            desc: "الأيام الملونة تدل على أوقات العمل المتاحة التي تتضمن أماكن شاغرة."
          },
          {
            title: "3. اختيار الوقت أو رقم الدور",
            desc: "وفقاً لطريقة عمل العيادة، ستختار إما وقتاً محدداً (مثلاً: 10:15 صباحاً) أو تذكرة دور متسلسلة مع وقت تقديري."
          },
          {
            title: "4. تحديد سبب الزيارة الطبية",
            desc: "اختر نوع الكشف (فحص أولي، مراقبة، شهادة طبية، تجديد وصفة علاجية...)."
          },
          {
            title: "5. تحديد المستفيد وتأكيد الحجز",
            desc: "حدد ما إذا كان الموعد لك شخصياً أو لأحد أفراد عائلتك المضافين بحسابك، ثم اضغط «تأكيد الحجز». مبروك، موعدك محجوز بنجاح!"
          }
        ],
        tip: "بمجرد تأكيد الحجز يظهر لك ملخص كامل بعنوان العيادة وتصلك رسالة تأكيد عبر البريد الإلكتروني.",
        warning: "المنصة لا تطلب أي دفع إلكتروني؛ دفع تكلفة الكشف الطبي يتم كالمعتاد نقداً مباشرة في عيادة الطبيب عند حضورك."
      },
      en: {
        intro: "Booking an appointment takes less than 2 minutes without any advance online payment:",
        steps: [
          {
            title: "1. Select the doctor & click 'Book'",
            desc: "On the doctor's profile, open the booking schedule."
          },
          {
            title: "2. Select a date",
            desc: "Available working days with open slots are highlighted."
          },
          {
            title: "3. Choose a slot or queue number",
            desc: "Depending on the clinic, select either an exact time slot (e.g. 10:15 AM) or a sequential ticket number with an estimated consultation time."
          },
          {
            title: "4. Choose visit reason",
            desc: "Select your visit reason (First consultation, follow-up, medical certificate, etc.)."
          },
          {
            title: "5. Choose patient & confirm",
            desc: "Specify if the booking is for yourself or a family member, then confirm. Your booking is instantly confirmed!"
          }
        ],
        tip: "You will immediately receive an on-screen summary and an email confirmation with complete clinic details.",
        warning: "No online payment is required: consultation fees are paid directly at the doctor's office."
      }
    }
  },
  {
    slug: "comprendre-les-modes-de-consultation",
    categoryId: "prendre-un-rendez-vous",
    isPopular: false,
    readTime: "3 min",
    titles: {
      fr: "Comprendre les deux modes de réservation : Heure fixe vs File d'attente",
      ar: "الفرق بين نظام المواعيد المحددة بالساعة ونظام قائمة الدور",
      en: "Understanding the 2 Booking Modes: Fixed Time vs Queue Numbers"
    },
    summaries: {
      fr: "Pourquoi certains médecins proposent des heures précises alors que d'autres attribuent un numéro de ticket avec heure estimée.",
      ar: "تعرف على سبب استخدام بعض الأطباء لنظام التذاكر والأرقام المتسلسلة والبعض الآخر لمواعيد محددة بالدقيقة.",
      en: "Learn why some doctors use specific time slots while others use sequential queue tickets."
    },
    content: {
      fr: {
        intro: "En Algérie, les cabinets médicaux fonctionnent selon deux méthodes d'organisation différentes. TABIBI respecte le choix de chaque médecin :",
        steps: [
          {
            title: "Mode 1 : Rendez-vous à heure précise (Time Slots)",
            desc: "Vous choisissez une heure fixe (par exemple 09h30). Le médecin réserve cette plage horaire pour votre consultation."
          },
          {
            title: "Mode 2 : File d'attente avec numéro de ticket (Queue Numbers)",
            desc: "Le médecin attribue un numéro séquentiel (ex: Ticket n° 5). L'application calcule une heure estimée basée sur le temps moyen de consultation, vous évitant de longues heures d'attente en salle."
          }
        ],
        tip: "Dans le mode file d'attente, prévoyez d'arriver au cabinet 10 à 15 minutes avant l'heure estimée.",
        warning: "Le temps consacré à chaque patient peut varier selon la complexité médicale des cas précédents."
      },
      ar: {
        intro: "في العيادات الطبية بالجزائر، يعتمد الأطباء على نمطين تنظيميين مختلفين. تدعم منصة طبيبي كلا النظامين بدقة:",
        steps: [
          {
            title: "النمط الأول: نظام المواعيد المحددة بالساعة (Time Slots)",
            desc: "تختار ساعة محددة ودقيقة (مثلاً 09:30 صباحاً)، ويتم حجز هذه الفترة الزمنية المحددة لك في جدول الطبيب."
          },
          {
            title: "النمط الثاني: نظام قائمة الدور والتذاكر المرقّمة (Queue Numbers)",
            desc: "تحصل على رقم تذكرة متسلسل (مثلاً تذكرة رقم 5). يقوم النظام بحساب التوقيت التقريبي لدخولك تلقائياً بناءً على متوسط مدة الكشف لكل مريض، مما يجنبك الانتظار الطويل في قاعة الانتظار."
          }
        ],
        tip: "في نظام التذاكر وقائمة الدور، ننصح بالحضور إلى العيادة قبل 10 إلى 15 دقيقة من الوقت التقديري لتأكيد حضورك لدى السكرتيرة.",
        warning: "التوقيت في نظام الدور هو توقيت تقديري؛ قد يطول فحص بعض الحالات الطبية المعقدة للمرضى السابقين."
      },
      en: {
        intro: "Clinics in Algeria operate under two distinct organizational systems. TABIBI accommodates both:",
        steps: [
          {
            title: "Mode 1: Fixed Time Slots",
            desc: "You book an exact consultation time (e.g. 09:30 AM) reserved specifically for you."
          },
          {
            title: "Mode 2: Sequential Queue Numbers",
            desc: "You receive a sequential ticket (e.g. Ticket #5). The platform computes an estimated arrival time based on the doctor's average consultation duration."
          }
        ],
        tip: "In queue mode, arrive at the clinic 10-15 minutes before your estimated time.",
        warning: "Estimated times may fluctuate if previous patients require extended medical care."
      }
    }
  },

  // ── 5. GÉRER MES RENDEZ-VOUS ────────────────────────────────
  {
    slug: "retrouver-et-gerer-ses-rendez-vous",
    categoryId: "gerer-mes-rendez-vous",
    isPopular: true,
    readTime: "3 min",
    titles: {
      fr: "Consulter l'historique et annuler un rendez-vous",
      ar: "كيفية مراجعة المواعيد المحجوزة وإلغاء موعد عند التعذر",
      en: "Viewing Appointment History & Cancelling a Visit"
    },
    summaries: {
      fr: "Retrouvez vos rendez-vous à venir et passés dans votre espace personnel et découvrez comment annuler en un clic.",
      ar: "طريقة متابعة مواعيدك القادمة والسابقة، ومعرفة تفاصيل كل موعد وإلغائه بكل بساطة إذا لم تستطع الحضور.",
      en: "Track upcoming and past appointments in your dashboard and cancel easily if your plans change."
    },
    content: {
      fr: {
        intro: "Tous vos rendez-vous sont centralisés dans votre espace patient pour une gestion en toute sérénité.",
        steps: [
          {
            title: "1. Accéder à « Mes rendez-vous »",
            desc: "Cliquez sur le lien « Mes rendez-vous » dans la barre de navigation ou dans le menu de votre compte."
          },
          {
            title: "2. Visualiser les rendez-vous à venir",
            desc: "Consultez la date, l'heure, le nom du médecin, l'adresse de la clinique et le statut du rendez-vous."
          },
          {
            title: "3. Annuler un rendez-vous si nécessaire",
            desc: "En cas d'empêchement, cliquez sur le bouton rouge « Annuler le rendez-vous » et confirmez l'annulation."
          }
        ],
        tip: "L'annulation libère immédiatement le créneau pour d'autres patients en attente.",
        warning: "Annulez toujours au moins quelques heures à l'avance par respect pour le temps du médecin et des autres patients."
      },
      ar: {
        intro: "تتيح لك صفحة مواعيدي متابعة كافة الحجوزات الطبية في مكان واحد وبسهولة تامة:",
        steps: [
          {
            title: "1. الدخول إلى صفحة «مواعيدي»",
            desc: "اضغط على تبويب «مواعيدي» في أعلى القائمة الرئيسية لحسابك."
          },
          {
            title: "2. مراجعة المواعيد القادمة والسابقة",
            desc: "تظهر لك بطاقة لكل موعد تحتوي: اسم الطبيب، تاريخ ووقت الكشف، عنوان العيادة، وحالة الموعد (قادم، مؤكد، ملغى)."
          },
          {
            title: "3. إلغاء الموعد عند وجود مانع",
            desc: "إذا طرأ ظرف يمنعك من الحضور، اضغط على زر «إلغاء الموعد» وقم بتأكيد الإلغاء."
          }
        ],
        tip: "إلغاء الموعد فور علمك بتعذر حضورك يسمح تلقائياً لمريض آخر بحجز ذلك الموعد الشاغر.",
        warning: "يرجى إلغاء الموعد قبل موعده بوقت كافٍ احتراماً لوقت الطبيب وسكرتارية العيادة والمرضى الآخرين."
      },
      en: {
        intro: "All your medical consultations are centralized in your patient appointments page:",
        steps: [
          {
            title: "1. Navigate to 'My Appointments'",
            desc: "Click 'My Appointments' in the top menu bar."
          },
          {
            title: "2. Review appointments",
            desc: "See date, time, physician name, clinic address, and booking status."
          },
          {
            title: "3. Cancel if necessary",
            desc: "If you cannot attend, click 'Cancel Appointment' and confirm."
          }
        ],
        tip: "Cancelling promptly makes the slot available to other waiting patients.",
        warning: "Please cancel as early as possible out of courtesy to your physician."
      }
    }
  },

  // ── 6. NOTIFICATIONS ────────────────────────────────────────
  {
    slug: "comprendre-les-notifications",
    categoryId: "notifications",
    isPopular: false,
    readTime: "2 min",
    titles: {
      fr: "Comprendre les notifications et confirmations de rendez-vous",
      ar: "كيف تعمل الإشعارات ورسائل تأكيد المواعيد في طبيبي",
      en: "Understanding Notifications & Booking Confirmations"
    },
    summaries: {
      fr: "Découvrez comment fonctionne le centre de notifications (icône cloche) et les emails de confirmation envoyés par TABIBI.",
      ar: "تعرف على إشعارات المنصة عبر رمز الجرس ورسائل البريد الإلكتروني التي تؤكد مواعيدك الطبية.",
      en: "Discover how the notification bell and email alerts keep you updated on your consultations."
    },
    content: {
      fr: {
        intro: "TABIBI vous tient informé à chaque étape de votre démarche médicale grâce à des alertes automatiques.",
        steps: [
          {
            title: "La cloche de notifications sur le site",
            desc: "Située en haut à droite, elle s'allume avec un badge rouge dès qu'un nouvel événement concerne votre compte."
          },
          {
            title: "Email de confirmation instantané",
            desc: "Dès que vous confirmez un rendez-vous, un email récapitulatif vous est envoyé avec les détails de la consultation."
          },
          {
            title: "Réponses du support administratif",
            desc: "Si vous soumettez une réclamation ou une demande d'aide, vous recevez une notification dès que l'équipe TABIBI vous répond."
          }
        ],
        tip: "Vous pouvez marquer les notifications comme lues d'un clic en ouvrant le menu déroulant de la cloche.",
        warning: "Vérifiez que votre adresse email dans votre profil est toujours valide pour ne manquer aucune confirmation importante."
      },
      ar: {
        intro: "تبقيك منصة طبيبي على اطلاع دائم بكل مستجدات حسابك ومواعيدك الطبية عبر نظام إشعارات ذكي:",
        steps: [
          {
            title: "رمز الجرس في أعلى الشاشة",
            desc: "يظهر مؤشر أحمر فور ورود أي تحديث جديد يخص مواعيدك أو رسائل من إدارة المنصة."
          },
          {
            title: "رسالة التأكيد الفورية عبر البريد",
            desc: "بمجرد حجز الموعد، تتلقى رسالة إلكترونية تحتوي تاريخ ووقت الموعد ورقم التذكرة وعنوان العيادة."
          },
          {
            title: "تنبيهات الرد على طلبات الدعم",
            desc: "إذا أرسلت شكوى أو استفساراً لفريق الدعم، سيصلك إشعار فوري عند قيام الإدارة بالرد على تذكرتك."
          }
        ],
        tip: "يمكنك تحديد جميع الإشعارات كمقروءة بضغطة زر واحدة داخل القائمة المنسدلة للجرس.",
        warning: "تأكد من صحة بريدك الإلكتروني المسجل في حسابك حتى تضمن استلام جميع إشعارات الحجز بنجاح."
      },
      en: {
        intro: "TABIBI keeps you informed at every step of your healthcare journey through automated alerts:",
        steps: [
          {
            title: "The notification bell",
            desc: "Located at the top right, it shows a badge whenever a new update concerns your account."
          },
          {
            title: "Instant confirmation emails",
            desc: "Immediately after booking, an email arrives with complete consultation details."
          },
          {
            title: "Support ticket updates",
            desc: "Receive instant notifications whenever administrative support staff replies to your ticket."
          }
        ],
        tip: "You can click 'Mark all as read' inside the bell menu to clear notifications.",
        warning: "Keep your registered email address up to date to ensure you never miss an alert."
      }
    }
  },

  // ── 7. CONFIDENTIALITÉ ET SÉCURITÉ ──────────────────────────
  {
    slug: "protection-des-donnees-et-loi-18-07",
    categoryId: "confidentialite-et-securite",
    isPopular: true,
    readTime: "3 min",
    titles: {
      fr: "Protection des données de santé et conformité à la Loi 18-07",
      ar: "حماية البيانات الصحية والامتثال للقانون الجزائري 18-07",
      en: "Health Data Protection & Algerian Law 18-07 Compliance"
    },
    summaries: {
      fr: "Comment TABIBI protège vos informations médicales, gère vos consentements et vous permet d'exercer vos droits sur vos données.",
      ar: "كيف تضمن منصة طبيبي سرية بياناتك الصحية، إدارة موافقاتك، وحقك في تحميل أو حذف بياناتك بأمان.",
      en: "How TABIBI secures your health data, manages consent, and guarantees your personal data rights."
    },
    content: {
      fr: {
        intro: "TABIBI applique les plus hauts standards de confidentialité conformément à la législation algérienne (Loi 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel).",
        steps: [
          {
            title: "Chiffrement et sécurité des accès",
            desc: "Vos données et vos identifiants sont chiffrés. Aucun médecin n'a accès à vos rendez-vous pris chez d'autres confrères."
          },
          {
            title: "Gestion de vos consentements",
            desc: "Vous pouvez à tout moment consulter et révoquer vos consentements depuis votre profil dans l'onglet « Sécurité & Confidentialité »."
          },
          {
            title: "Droit au téléchargement de vos données",
            desc: "Exportez l'ensemble de vos données enregistrées sur TABIBI au format sécurisé d'un simple clic."
          },
          {
            title: "Droit à l'effacement (Suppression de compte)",
            desc: "Vous avez la possibilité de demander la suppression définitive de votre compte et de vos données personnelles."
          }
        ],
        tip: "Consultez notre politique de confidentialité détaillée accessible depuis le pied de page pour en savoir plus sur les durées légales de conservation.",
        warning: "Ne communiquez jamais votre mot de passe à un tiers. L'équipe TABIBI ne vous demandera jamais votre mot de passe."
      },
      ar: {
        intro: "تلتزم منصة طبيبي بأعلى معايير الحماية والأمان وفق أحكام القانون الجزائري رقم 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي:",
        steps: [
          {
            title: "تشفير وحماية البيانات الطبية",
            desc: "بياناتك الشخصية والصحية مشفرة بالكامل، ولا يمكن لأي طبيب الاطلاع على مواعيدك المسجلة لدى أطباء آخرين."
          },
          {
            title: "إدارة الموافقات والخصوصية",
            desc: "يمكنك في أي وقت مراجعة موافقاتك على معالجة البيانات وتعديلها عبر تبويب «الخصوصية والأمان» في ملفك الشخصي."
          },
          {
            title: "حق تحميل بياناتك (Data Portability)",
            desc: "توفر لك المنصة زراً مباشراً لتحميل نسخة كاملة من بياناتك وملفك بضغطة زر واحدة."
          },
          {
            title: "حق حذف الحساب والبيانات",
            desc: "يحق لك طلب حذف حسابك نهائياً ومسح كافة بياناتك الشخصية من الخوادم وفق ما ينص عليه القانون."
          }
        ],
        tip: "يمكنك مراجعة سياسة الخصوصية الشاملة في أسفل الموقع للاطلاع على كافة التفاصيل القانونية وفترات الحفظ النظامية.",
        warning: "لا تفصح أبداً عن كلمة مرورك لأي شخص؛ موظفو المنصة لن يطلبوا منك كلمة المرور بأي حال من الأحوال."
      },
      en: {
        intro: "TABIBI adheres strictly to Algerian Law 18-07 on personal data protection and medical privacy:",
        steps: [
          {
            title: "Data encryption and isolation",
            desc: "Your medical appointments and records are encrypted and isolated; no doctor can access consultations booked with other physicians."
          },
          {
            title: "Consent management",
            desc: "Inspect and update your data consent preferences anytime via Profile > Security & Privacy."
          },
          {
            title: "Right to data download",
            desc: "Export a full copy of your registered personal information with one click."
          },
          {
            title: "Right to account erasure",
            desc: "You can permanently delete your patient account and associated personal data at any time."
          }
        ],
        tip: "Visit our Privacy Policy in the footer for comprehensive retention and legal disclosures.",
        warning: "Never disclose your account password to anyone. TABIBI support staff will never ask for it."
      }
    }
  },

  // ── 8. ASSISTANCE ET SUPPORT ────────────────────────────────
  {
    slug: "signaler-un-probleme-et-contacter-le-support",
    categoryId: "assistance",
    isPopular: true,
    readTime: "3 min",
    titles: {
      fr: "Signaler un problème ou contacter le support administratif TABIBI",
      ar: "كيفية تقديم شكوى إدارية أو التواصل مع فريق دعم طبيبي",
      en: "Reporting an Issue & Contacting TABIBI Administrative Support"
    },
    summaries: {
      fr: "Utilisez le module officiel de support pour transmettre vos réclamations, signaler un bug technique ou poser une question.",
      ar: "طريقة استخدام نظام تذاكر الدعم الإداري والشكاوى الرسمي للتواصل المباشر مع إدارة منصة طبيبي.",
      en: "Use the official support ticketing module to submit complaints, report bugs, or request assistance."
    },
    content: {
      fr: {
        intro: "Si vous rencontrez une difficulté technique sur le site ou si vous souhaitez déposer une réclamation administrative, l'équipe TABIBI est à votre écoute.",
        steps: [
          {
            title: "1. Accéder au support administratif",
            desc: "Connectez-vous à votre compte et cliquez sur « Support / Administration » dans le menu de votre profil ou depuis le pied de page."
          },
          {
            title: "2. Créer une nouvelle réclamation",
            desc: "Cliquez sur « Nouvelle demande », choisissez la catégorie (Technique, Réclamation, Compte, Service...) et décrivez votre situation avec précision."
          },
          {
            title: "3. Suivre l'avancement de votre ticket",
            desc: "Un numéro de suivi unique (ex: ADM-2610-1234) est attribué à votre demande. Vous recevez une réponse officielle directement sur l'interface."
          }
        ],
        tip: "Pour toute question médicale sur votre état de santé ou vos ordonnances, contactez directement votre médecin traitant et non le support de la plateforme.",
        warning: "Le support administratif de TABIBI ne fournit aucun conseil médical et ne remplace pas une consultation médicale."
      },
      ar: {
        intro: "في حال واجهت أي مشكلة تقنية في استخدام الموقع، أو كانت لديك شكوى إدارية، يوفر لك موقع طبيبي نظام تذاكر رسمي للتواصل المباشر مع الإدارة:",
        steps: [
          {
            title: "1. الدخول إلى صفحة الدعم والشكاوى",
            desc: "سجل دخولك لحسابك واضغط على «الدعم الإداري / الشكاوى» من القائمة العلوية أو من أسفل الصفحة."
          },
          {
            title: "2. إنشاء تذكرة دعم جديدة",
            desc: "اضغط على «طلب جديد»، حدد الفئة (مشكلة تقنية، شكوى، مشكلة في الحساب، استفسار...) واشرح المشكلة بوضوح."
          },
          {
            title: "3. متابعة رد الإدارة",
            desc: "يتم توليد رقم تذكرة رسمي (مثال: ADM-2610-1234). ستتلقى إشعاراً وردّاً رسمياً من فريق إدارة طبيبي لمتابعة حالتك."
          }
        ],
        tip: "للاستفسارات الطبية المتعلقة بحالتك الصحية أو وصفتك العلاجية، يرجى التواصل مع طبيبك المعالج مباشرة وليس مع إدارة المنصة.",
        warning: "فريق دعم طبيبي يقدم المساعدة التقنية والإدارية فقط، ولا يقدم أي استشارات أو تشخيصات طبية على الإطلاق."
      },
      en: {
        intro: "If you encounter technical issues or wish to submit an administrative inquiry, the TABIBI support team is here to assist:",
        steps: [
          {
            title: "1. Access Administrative Support",
            desc: "Log in to your account and click 'Support / Complaints' in your profile menu or website footer."
          },
          {
            title: "2. Create a new support ticket",
            desc: "Click 'New Request', choose a category (Technical, Account, Inquiry, Complaint), and describe your issue."
          },
          {
            title: "3. Track administrative resolution",
            desc: "A unique tracking number (e.g. ADM-2610-1234) is generated. You will receive official responses directly in your ticket thread."
          }
        ],
        tip: "For medical questions regarding prescriptions or symptoms, contact your physician directly.",
        warning: "TABIBI administrative support handles platform inquiries only and does not provide medical advice."
      }
    }
  }
];

export const HELP_FAQS = [
  {
    id: "faq-1",
    questions: {
      fr: "La prise de rendez-vous sur TABIBI est-elle payante pour les patients ?",
      ar: "هل حجز المواعيد على منصة طبيبي مدفوع أم مجاني؟",
      en: "Is booking an appointment on TABIBI free for patients?"
    },
    answers: {
      fr: "Non, la prise de rendez-vous sur TABIBI est 100% gratuite pour les patients. Vous ne payez rien sur le site web. Le règlement de la consultation s'effectue directement sur place au cabinet du médecin selon ses tarifs habituels.",
      ar: "لا، حجز المواعيد عبر منصة طبيبي مجاني 100% لجميع المرضى. لا تطلب منك المنصة أي دفع بالبطاقة الذهبية أو البنكية. تسديد تكلفة الكشف الطبي يتم كالمعتاد نقداً مباشرة في عيادة الطبيب عند حضورك.",
      en: "No, booking on TABIBI is 100% free for patients. No payment is processed on the website. Consultation fees are paid directly at the doctor's office during your visit."
    }
  },
  {
    id: "faq-2",
    questions: {
      fr: "Puis-je prendre un rendez-vous pour un membre de ma famille (enfant, parent) ?",
      ar: "هل يمكنني حجز موعد لأحد أفراد أسرتي (أبنائي أو والديّ)؟",
      en: "Can I book an appointment for a family member (child, parent)?"
    },
    answers: {
      fr: "Oui, tout à fait ! Depuis votre profil, vous pouvez ajouter vos proches dans la rubrique « Gestion de la famille ». Au moment de valider votre réservation, sélectionnez simplement le proche concerné pour que son nom apparaisse au secrétariat médical.",
      ar: "نعم بالتأكيد! يمكنك من خلال صفحة ملفك الشخصي إضافة أفراد عائلتك في قسم «إدارة العائلة». وعند حجز أي موعد، يكفي اختيار اسم المستفيد من القائمة ليظهر اسمه هو في سجل استقبال العيادة.",
      en: "Yes! In your profile under 'Family Management', you can add dependents. When booking, select the relevant family member so their name appears in the clinic reception records."
    }
  },
  {
    id: "faq-3",
    questions: {
      fr: "Comment savoir si mon rendez-vous a bien été confirmé ?",
      ar: "كيف أتأكد من أن موعدي قد تم تأكيده بنجاح؟",
      en: "How do I know if my appointment was confirmed?"
    },
    answers: {
      fr: "Dès que vous cliquez sur « Confirmer », votre réservation est instantanément enregistrée. Vous recevez un email récapitulatif, une notification dans la cloche du site, et vous retrouvez la fiche détaillée du rendez-vous dans votre espace « Mes rendez-vous ».",
      ar: "بمجرد ضغطك على زر تأكيد الحجز، يتم تسجيل موعدك فوراً في نظام العيادة. ستصلك رسالة تأكيد إلكترونية وتنبيه في رمز الجرس، كما يظهر الموعد بحالته المؤكدة في صفحة «مواعيدي».",
      en: "As soon as you confirm, your booking is recorded immediately. You receive an email summary, a notification in your bell menu, and the booking appears in 'My Appointments'."
    }
  },
  {
    id: "faq-4",
    questions: {
      fr: "Que faire si j'ai un imprévu et que je ne peux pas me présenter au cabinet ?",
      ar: "ماذا أفعل إذا طرأ مانع ولم أستطع الحضور في الموعد المحدد؟",
      en: "What should I do if I cannot make it to my scheduled visit?"
    },
    answers: {
      fr: "Rendez-vous dans la rubrique « Mes rendez-vous », localisez la consultation concernée et cliquez sur « Annuler le rendez-vous ». Cette démarche simple permet de libérer le créneau pour un autre patient qui en a besoin.",
      ar: "يرجى الدخول إلى صفحة «مواعيدي» والضغط على زر «إلغاء الموعد» الخاص بذلك الحجز. هذا التصرف الحضاري يتيح لمرضى آخرين حجز ذلك التوقيت الشاغر ويعلم الطبيب بعدم حضورك.",
      en: "Navigate to 'My Appointments', find the consultation, and click 'Cancel Appointment'. This frees up the slot for another patient in need."
    }
  },
  {
    id: "faq-5",
    questions: {
      fr: "Pourquoi le médecin m'a attribué un numéro de ticket au lieu d'une heure précise ?",
      ar: "لماذا يظهر لي رقم تذكرة ووقت تقديري بدلاً من توقيت دقيق بالدقيقة؟",
      en: "Why do I see a queue ticket number instead of an exact time?"
    },
    answers: {
      fr: "Certains médecins en Algérie organisent leurs consultations par ordre de passage en file d'attente. TABIBI vous attribue un numéro de ticket et estime automatiquement votre heure de passage, ce qui vous évite d'attendre des heures dans la salle d'attente.",
      ar: "يعتمد بعض الأطباء في الجزائر نظام الطابور والدور المنظم بالتذاكر. تقوم المنصة بمنحك رقم دور وتوقع وقت وصولك التقريبي وفق متوسط مدة الكشف لتفادي الانتظار الطويل داخل العيادة.",
      en: "Some doctors organize consultations sequentially via a queue. TABIBI assigns a ticket number and computes an estimated consultation time, preventing lengthy waiting room delays."
    }
  }
];
