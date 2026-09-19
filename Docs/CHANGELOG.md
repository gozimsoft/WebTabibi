# Changelog

سجل تغييرات مشروع طبيبي.

## 2026-09-19

- **إصلاح وتيسير تسجيل الدخول والتسجيل عبر Google للأطباء والمرضى والتوافق مع شروط الاستخدام (Loi 18-07)**:
  - **تمكين تسجيل دخول الأطباء والعيادات عبر Google (`AuthController.php`)**:
    - كان مسار Google مقتصراً على المرضى فقط ويرفض أي بريد لطبيب مسجل بخطأ `409 Conflict`.
    - تم دعم تسجيل دخول الأطباء المعتمدين (`status = 'APPROVED'`) بسلاسة، مع التأكيد التلقائي للبريد (`emailvalidation = 1`) وإرجاع بيانات العيادات والجلسة ونوع المستخدم `1`.
    - دعم تسجيل دخول مدراء العيادات (`usertype = 2`) وتأكيد بريدهم تلقائياً.
    - إرجاع رسائل بشرية واضحة للطلبات التي لا تزال قيد المراجعة (`PENDING`).
  - **إتاحة خانة قبول الشروط لزر Google في صفحتي الدخول والتسجيل (`LoginPage` & `RegisterPage`)**:
    - إضافة خانة اختيار مباشرة أسفل زر Google الرسمي في كل من صفحة تسجيل الدخول `#/login` وصفحة إنشاء الحساب `#/register` تتيح للمستخدم الموافقة المسبقة على شروط الاستخدام وسياسة الخصوصية.
    - ربط خانة موافقة Google في صفحة التسجيل مع خانات الشروط التفصيلية لتعمل بتزامن فوري عند النقر.
  - **حل مشكلة الإغلاق القديم (Stale Closure) في كولباك Google Identity Services**:
    - استخدام `useRef` لقراءة حالة الموافقة لحظياً داخل كولباك Google لمنع قراءة القيمة الأولية الخاطئة (`false`).
  - **إضافة نافذة منبثقة تفاعلية للموافقة الفورية (Consent Modal)**:
    - في حال نقر المستخدم على زر Google دون تحديد خانة الشروط، يتم عرض نافذة منبثقة أنيقة ومباشرة تطلب منه تأكيد الموافقة على الشروط والخصوصية وتتيح له المتابعة بنقرة واحدة دون الحاجة لإعادة العملية أو حظره بأخطاء غامضة.
  - **حفظ أدلة ومطابقة الموافقة القانونية في قاعدة البيانات**:
    - عند إنشاء حساب مريض جديد عبر Google، يتم حفظ `consent_cgu = 1` و `consent_privacy = 1` و `consent_version` و `consent_at` في جدول `patients`، وتسجيل العملية في جدول `consent_logs` وفق القانون 18-07.

## 2026-09-18

- **منع تكرار فتح تذاكر الدعم والرسائل المفتوحة للمريض مع الطبيب أو العيادة (`TicketController.php` & `NewTicketPage`)**:
  - فحص وجود تذكرة مفتوحة مسبقاً (`status != 'CLOSED'`) في الخادم قبل السماح بإنشاء أي تذكرة جديدة لنفس الطبيب أو العيادة أو الدعم العام، ورفض التكرار برمز `409 Conflict` مع إرجاع معرف التذكرة المفتوحة.
  - إضافة نقطة نهاية مخصصة `GET /api/tickets/check-open` للتحقق المسبق من وجود تذكرة مفتوحة لمريض مع طبيب أو عيادة محددة.
  - تحديث صفحة إرسال الرسائل (`NewTicketPage`):
    - الفحص الفوري عند فتح الصفحة عن وجود محادثة نشطة مع الطبيب المحدد.
    - في حال وجود تذكرة مفتوحة، يتم حظر إرسال تذكرة مكررة وعرض بطاقة تنبيهية توضيحية تتضمن موضوع المحادثة الجارية وتاريخها، مع زر مباشر للانتقال إليها (`Accéder à la conversation` / `الانتقال إلى المحادثة المفتوحة`).
    - إتاحة قائمة منسدلة لاختيار الطبيب من قائمة أطباء المريض في حال فتح الصفحة دون تحديد طبيب في الرابط.
  - إضافة نصوص الترجمة الكاملة في `fr.json` و `ar.json` و `en.json`.

- **محاذاة وضبط عرض صفحة البحث مع شريط التنقل (`SearchPage` في `App.jsx`)**:
  - تصحيح العرض الأقصى لحاوية صفحة البحث من `1360px` إلى `1200px` (`maxWidth: 1200, width: "100%"`) لتتطابق تماماً مع معايير صفحات الموقع وشريط التنقل.
  - ضبط الهوامش الداخلية الجانبية إلى `padding: isMobile ? "16px 16px" : "24px 24px"` لتتوافق حواف صفحة البحث يميناً ويساراً مع أقصى حدود عناصر الـ Navbar (شعار الموقع من طرف، وأزرار الحساب والقائمة من الطرف الآخر).
  - اختبار وتأكيد المحاذاة الدقيقة في كلا الاتجاهين اللغويين (العربية RTL والفرنسية LTR).

- **محاذاة وضبط عرض صفحة الدليل مع شريط التنقل وباقي الصفحات (`UserGuide.jsx`)**:
  - تعديل العرض الأقصى لصفحة الدليل من `920px` إلى `1200px` (`maxWidth: 1200, width: "100%"`) لتتطابق تماماً مع بقية صفحات الموقع.
  - توحيد الهوامش الداخلية (`padding: isMobile ? "0 16px" : "0 24px"`) لضمان محاذاة الحواف اليمنى واليسرى لبطاقات الدليل وشريط الخطوات وأزرار التنقل بدقة متناهية مع شعار الموقع وعناصر الحساب في الـ Navbar.
  - إعطاء مساحة أوسع وأكثر راحة لشبكة التخصصات الطبية ومحتوى الخطوات على الشاشات الكبيرة والمتوسطة.

- **تحويل دليل التخصصات إلى شروح طبية إنسانية مبسطة وإزالة المصطلحات التقنية (`UserGuide.jsx` & `SearchPage`)**:
  - إزالة جميع الأكواد اللونية السداسية التقنية (`#...`) وتفاصيل البكسل (`2.5px`) غير المفهومة للمستخدم العادي.
  - إضافة شروحات طبية إنسانية موجزة (سطران كحد أقصى) لكل تخصص من التخصصات الـ 16 (مثل توضيح دور طبيب الأعصاب، القلب، الجهاز الهضمي، الأطفال، إلخ وما يعالجه ومتى يجب استشارته).
  - تحويل زر شريط البطاقة المعاينة إلى زر إجراء حقيقي لحجز الموعد (`Prendre RDV` / `حجز موعد`) بدلاً من النصوص التقنية.
  - تحويل عنوان القسم إلى "دليل التخصصات الطبية / Guide des Spécialités Médicales" وتحديث زر الاختصار في صفحة البحث ليصبح `📚 دليل التخصصات / Guide des spécialités`.
  - تحديث كامل الترجمات في ملفات `fr.json` و `ar.json` و `en.json`.

- **إضافة دليل التخصصات في دليل المستخدم وصفحة البحث (`UserGuide.jsx` & `SearchPage`)**:
  - دمج قسم تفاعلي كامل لدليل ألوان التخصصات في الخطوة الثانية (البحث والاكتشاف) بصفحة الدليل `http://localhost:81/#/guide`.
  - عرض 16 تخصصاً طبياً مع ألوانها المخصصة ونقاط متوهجة مع الحافة العلوية المميزة بسماكة `2.5px solid`.
  - إتاحة معاينة تفاعلية حية (Live Interactive Preview Card) تتيح النقر على أي تخصص لمشاهدة بطاقة طبيب واقعية بنفس التصميم، الشارات، التقييم، والشريط الملون السفلي.
  - دعم التنقل المباشر عبر المعلمة `#/guide?step=search` للفتح التلقائي على خطوة البحث.
  - إضافة زر اختصار سريع `🎨 دليل الألوان / Code couleurs` بجوار عدد نتائج البحث في صفحة `#/search` لنقل المستخدم مباشرة إلى دليل الألوان.
  - إضافة ترجمات كاملة بالعربية والفرنسية والإنجليزية في ملفات `ar.json` و `fr.json` و `en.json` ودعم كامل لاتجاه RTL.

- **تعديل بطاقات البحث في صفحة البحث (`SearchPage` في `frontend/src/App.jsx`)**:
  - تصغير أحجام بطاقات البحث وضبطها لتظهر بدقة بواقع 4 بطاقات في كل سطر (`gridTemplateColumns: repeat(4, minmax(0, 1fr))`).
  - تصغير حجم صور الأطباء وهوامش المحتوى الداخلي لتتناسب بدقة مع العرض الرباعي الجديد دون أي تداخل.
  - إتاحة وتثبيت مربع اختيار "عيادات فقط" لجميع المستخدمين، وإلغاء شرط حجب الأطباء عند تسجيل الدخول بحساب طبيب.
  - ربط وتخصيص لون الإطار العلوي للقسم السفلي للبطاقة (`borderTop`) لكل تخصص طبي مع زيادة سُمكه إلى `2.5px solid`، وربط لون شارة التخصص والتقييم بهذا اللون المخصص.

## 2026-09-17

- **ضبط التقويم وإدارة المواعيد على الأسبوع الحالي افتراضياً (`AppointmentManager`)**:
  - ضبط الفلتر الافتراضي ونطاق التاريخ (`dateFrom` / `dateTo`) ليبدأ تلقائياً من بداية الأسبوع الحالي (الإثنين) إلى نهايته (الأحد).
  - إضافة خيار "الأسبوع الحالي" (`Cette semaine` / `appt_mgr_this_week`) كزر نشط ومحدد افتراضياً ضمن أزرار الفلترة السريعة.
  - مزامنة التقويم الأسبوعي (`WeeklyScheduleView`) ليبدأ دائماً على الأسبوع الحالي تلقائياً فور فتح الصفحة.
- **تصحيح وتدقيق نصوص صفحة اتصل بنا (`Contact` / `fr.json`)**:
  - تصحيح الخطأ الإملائي في نص الملاحظة الإرشادية من `répondرا` إلى `répondra` لتصبح: *"L'équipe de support technique répondra à vos questions dans les 24 heures ouvrables."*.
  - إضافة ترجمة حقل التخصص المفقودة في الفرنسية (`specialty`: *"Spécialité"*).
- **تصغير وتكثيف بطاقات المواعيد في عرض القائمة وإضافة ميزة الترتيب (`AppointmentManager`)**:
  - تصغير أبعاد وهوامش بطاقات المواعيد (`.appt-card`) لتقليل المساحة الرأسية بنسبة ~50% وعرض عدد أكبر بكثير من المواعيد على الشاشة دون الحاجة للتمرير:
    - تقليص الحشو الداخلي للبطاقة إلى `12px 14px` وتقليص الأيقونة الرمزية إلى `32x32`.
    - دمج التاريخ والوقت في سطر واحد متناسق وأنيق بدلاً من سطرين منفصلين مع شارة توقيت مدمجة.
    - تقليص هوامش وأزرار الإجراءات (إتمام الزيارة ✓، إلغاء ✕، غائب ABSENT) والوسوم لتصبح أكثر إحكاماً وسلاسة.
    - تعديل شبكة العرض إلى `repeat(auto-fill, minmax(250px, 1fr))` بفراغ `12px`، مما يتيح عرض 4 بطاقات كاملة في كل سطر على الشاشات العادية بدلاً من بطاقتين فقط.
  - إضافة خيارات فرز وترتيب سريعة ومتقدمة (`Sort Selector`) بجانب فلاتر البحث والحالة:
    - الترتيب حسب التاريخ الأقرب (`date_asc`) أو الأحدث (`date_desc`).
    - الترتيب حسب اسم المريض أبجدياً (`name_asc`).
    - الترتيب حسب حالة الموعد (`status`).
    - حفظ خيار الترتيب المفضل في `localStorage` مع ترجمة كاملة للعربية والفرنسية والإنجليزية.
  - **إعادة تنظيم وتوزيع شريط التواريخ والنتائج في سطر واحد متوازن**:
    - فصل محدد التاريخ (من / إلى) ليكون في طرف، وشارات ملخص النتائج (عدد المواعيد، العيادة، نطاق التاريخ) في الطرف المقابل عبر (`justify-content: space-between`).
- **تهيئة وتفعيل حساب الطبيب `benazet` في قاعدة البيانات المحلية**:
  - ضبط اسم المستخدم إلى `benazet` في جدول `users` بنوع حساب طبيب (`usertype = 1`) وكلمة مرور `password123`.
  - ربط الحساب بسجل الطبيب `Benazet jérémy` في جدول `doctors` بحالة معتمدة (`APPROVED`) وتفعيل البريد والهاتف (`emailvalidation = 1`).
  - التأكد من ربط الحساب بعيادة `Saint germain` وتحميل مواعيده التسعة (9) في جدول التقويم مباشرة.
- **إخفاء شريط التنقل (Navbar) والتذييل (Footer) لصفحة التطبيق `/app` وجعلها متجاوبة كلياً للأجهزة المحمولة**:
  - تحديث [`frontend/src/App.jsx`](file:///c:/xampp/htdocs/tabibi/frontend/src/App.jsx) لعدم عرض الـ Navbar والـ Footer في مسار `/app`، لتصبح صفحة هبوط مستقلة وغامرة بالكامل.
  - تحسين تجاوب صفحة تحميل التطبيق [`frontend/src/pages/AppDownload.jsx`](file:///c:/xampp/htdocs/tabibi/frontend/src/pages/AppDownload.jsx) لتكون مخصصة للهواتف الذكية (Mobile-First):
    - إضافة ترويسة علوية شفافة وخفيفة تضم شعار طبيبي للعودة للرئيسية ومحول لغات ذكي (العربية / الفرنسية / الإنجليزية).
    - ترتيب العناصر بما يضمن وصول المستخدم لأزرار التحميل (APK و المتاجر) مباشرة أعلى الشاشة (Above the fold) دون الحاجة للتمرير الطويل.
    - استجابة كاملة للخطوط والأزرار ومجسم الهاتف الذكي بنسبة عرض إلى ارتفاع مرنة ومنع أي تمرير أفقي غير مرغوب (Zero horizontal scroll).
- **حذف رابط تطبيق طبيبي من شريط التنقل العلوي (Navbar)**:
  - إزالة عنصر [`mobile_app` ("Application Tabibi / تطبيق طبيبي")](file:///c:/xampp/htdocs/tabibi/frontend/src/App.jsx) من قائمة روابط شريط التنقل `navLinks`.
- **تبسيط واقتصار صفحة تحميل التطبيق على واجهة البطل فقط مطابقة للصورة (`AppDownloadPage`)**:
  - إعادة تصميم [`frontend/src/pages/AppDownload.jsx`](file:///c:/xampp/htdocs/tabibi/frontend/src/pages/AppDownload.jsx) لتعرض حصرياً القسم الرئيسي كما في الصورة المرجعية:
    - الشارة المضيئة (L'application médicale N°1 en Algérie).
    - العنوان والوصف التسويقي، وزر التحميل المباشر لملف الـ APK مع أزرار Google Play و App Store والشارات التقييمية ومشاركة الرابط.
    - مجسم الهاتف الذكي بنوتش Dynamic Island وصورة المعاينة الحقيقية مع الشارتين العائمتين (★ 4.9 و 31K+ Patients).
    - إزالة بطاقة الـ QR Code وجميع الأقسام السفلية (الأعمدة الثلاثة، خطوات العمل، شبكة المميزات، المواصفات الفنية، دليل التثبيت، الأسئلة الشائعة، وبانر الدعوة للعمل).
- **تعديل منفذ خادم التطوير (Vite Dev Server) إلى المنفذ 81**:
  - تحديث إعدادات `port: 81` في [`frontend/vite.config.js`](file:///c:/xampp/htdocs/tabibi/frontend/vite.config.js).
  - تحديث `FRONTEND_URL=http://localhost:81` في [`backend/.env`](file:///c:/xampp/htdocs/tabibi/backend/.env).
  - تشغيل خادم الواجهة الأمامية على `http://localhost:81` وخادم الواجهة الخلفية على `http://localhost:8000`.

- **تحسين وإصلاح عرض المواعيد في التقويم الأسبوعي وإتمام الزيارات (`AppointmentManager`)**:
  - عدم حذف الموعد أو إخفائه من التقويم عند ضغط الطبيب على الزر الأخضر (إتمام الموعد ✓)، بل إبقاؤه في موقعه بالتقويم وتحويل لونه إلى الرمادي (`Used / Completed`).
  - تطبيق اللون الرمادي تلقائياً على كافة المواعيد السابقة والمنتهية في التقويم مع الحفاظ على الأزرار المخصصة بلونها الأخضر والأحمر الواضح.
  - إضافة سبب الموعد (`reason_name`) إلى التلميح التفاعلي (`Tooltip`) عند تمرير الماوس فوق بطاقة الموعد مع اسم المريض والحالة.
  - إضافة ميزة تمييز المريض الغائب (`ABSENT`): عند انقضاء موعد الحجز دون اتخاذ أي إجراء من الطبيب، يتم تلقائياً حذف زري الإتمام والإلغاء (✓ و ✕) واستبدالهما بزر تحذيري باللون الأصفر يحمل نص `ABSENT` (غائب) مع بقاء إطار وخلفية بطاقة الموعد باللون الرمادي.
  - تخصيص قائمة `calendarAppointments` لضمان عدم حجب المواعيد المكتملة أو السابقة أثناء التصفح الأسبوعي.
- **الربط مع قاعدة البيانات المحلية وإعادة إنشاء المستخدمين (Local DB Setup & Users Configuration)**:
  - استيراد واستنساخ قاعدة البيانات بالكامل مع الحفاظ على ترميز UTF-8 إلى MySQL المحلي (`127.0.0.1:3306`) باسم `uyyuppcc_DBTabibi`.
  - تحديث ملف الإعدادات [`backend/.env`](file:///c:/xampp/htdocs/tabibi/backend/.env) ليشير إلى قاعدة البيانات المحلية (`DB_HOST=127.0.0.1`, `DB_USER=root`, `DB_PASS=""`).
  - إعادة إنشاء وتهيئة الحسابات على القاعدة المحلية:
    - حساب الطبيب [`taybikhaled487`](file:///c:/xampp/htdocs/tabibi/backend/controllers/AuthController.php) بكلمة مرور `password123` (مرتبط بالطبيب والعيادة وكافة المواعيد).
    - حساب الطبيب العام `doctor` بكلمة مرور `password123`.
    - حساب المريض `patient` بكلمة مرور `password123`.
    - حساب المدير `admin` بكلمة مرور `amar1990`.
- **جعل عرض التقويم هو الافتراضي دائماً مع الحفظ المحلي (`AppointmentManager`)**:
  - ضبط نمط العرض الافتراضي في التقويم الأسبوعي (`viewMode = "calendar"`).
  - حفظ خيار العرض المفضل في `localStorage` باسم `tabibi_appt_view_mode` ليظل التقويم هو الواجهة الثابتة عند الدخول أو إعادة تحميل الصفحة.
  - تثبيت وتصحيح حساب يوم بداية الأسبوع محلياً لتجنب أي إزاحة في التوقيت الصيفي/الشتوي.
- **تأكيد وتوضيح ظهور زر الغائب (ABSENT Button)**:
  - زر الغائب يظهر تلقائياً باللون الأصفر التحذيري وبإطار رمادي على المواعيد التي فات وقتها وتاريخها دون اتخاذ إجراء (مثل موعد الثلاثاء 15 سبتمبر الساعة 14:00).
  - المواعيد القادمة في المستقبل (مثل موعد السبت 19 سبتمبر الساعة 10:40) تظل تحتفظ ببطاقتها الصفراء وزري الإتمام (✓) والإلغاء (✕) لأن وقت الموعد لم يحن بعد.

### Documentation Updated
Yes

---

## 2026-09-13

### Added
- **إضافة تبويب إعدادات المواعيد في صفحة الملف الشخصي للطبيب (`DoctorAppointmentSettings`)**:
  - مطابقة إعدادات نافذة Clinic لسطح المكتب (نوع الجدولة بالساعة أو بالترتيب، التكرار، مدة الموعد، تفعيل تأكيد المواعيد، الإشعار المسبق، الحجز المتزامن، نمط التقويم، أيام العطل الأسبوعية، وحساب المواعيد الشاغرة).
  - إضافة واجهات برمجية في الخلفية (`GET /api/doctor/settings/appointments` و `POST /api/doctor/settings/appointments`) وإدراج الأعمدة تلقائياً إذا لم تكن موجودة.
  - دعم الترجمات الكاملة (عربية، فرنسية، إنجليزية).
- **إضافة شارة عدد الرسائل والتنبيهات غير المقروءة للطبيب في شريط التنقل العلوي (`Navbar`)**:
  - عرض Badge أحمر ديناميكي بالرسائل غير المقروءة لكل من حسابات الأطباء والمستخدمين.
  - إضافة نقطة نهاية مخصصة `GET /api/tickets/unread-count` متوافقة مع حسابات الأطباء والعيادات.
- **إعداد وثيقة خطة تأمين الأسرار والإعدادات (Phase 05A)**:
  - إضافة ملف التوثيق الشامل [`Docs/TABIBI_PHASE_05A_SECURISATION_PLAN.md`](file:///c:/xampp/htdocs/tabibi/Docs/TABIBI_PHASE_05A_SECURISATION_PLAN.md).
- **تنفيذ تأمين وإخراج الأسرار والإعدادات الحساسة (Phase 05B)**:
  - إخراج أسرار قاعدة البيانات وخدمة البريد من الكود إلى ملف بيئة محلي غير متبع `backend/.env`.
  - إضافة محمل بيئة PHP أصلي وخفيف في [`backend/config/database.php`](file:///c:/xampp/htdocs/tabibi/backend/config/database.php) دون أي مكتبات خارجية.
  - إخراج بيانات توقيع الأندرويد من `build.gradle` إلى `frontend/android/keystore.properties` مع الاحتفاظ الصارم بملف المفاتيح الأصلي `tabibi-release.jks`.
  - إلغاء تتبع الملفات الحساسة من Git (`frontend/tabibi-release.jks`, `frontend/.env`, `Compile et signe APK .txt`) مع إبقائها محلياً.
  - إضافة قوالب النماذج [`backend/.env.example`](file:///c:/xampp/htdocs/tabibi/backend/.env.example)، [`frontend/.env.example`](file:///c:/xampp/htdocs/tabibi/frontend/.env.example)، و [`frontend/android/keystore.properties.example`](file:///c:/xampp/htdocs/tabibi/frontend/android/keystore.properties.example).
  - تحديث قواعد الحماية في [`.gitignore`](file:///c:/xampp/htdocs/tabibi/.gitignore).
  - إضافة تقارير التوثيق الفني [`Docs/TABIBI_PHASE_05B_EXTERNALISATION_SECRETS.md`](file:///c:/xampp/htdocs/tabibi/Docs/TABIBI_PHASE_05B_EXTERNALISATION_SECRETS.md)، [`Docs/TABIBI_PHASE_05C_AUDIT_ROTATION.md`](file:///c:/xampp/htdocs/tabibi/Docs/TABIBI_PHASE_05C_AUDIT_ROTATION.md)، و [`Docs/TABIBI_PHASE_05C_B_RAPPORT_ROTATION.md`](file:///c:/xampp/htdocs/tabibi/Docs/TABIBI_PHASE_05C_B_RAPPORT_ROTATION.md).

### Fixed
- **إصلاح زر التواصل (`Contact`) في بطاقات المواعيد**:
  - توجيه الزر إلى نظام التذاكر والرسائل المعتمد `/tickets/new?doctor_id=...` بدلاً من الرابط غير الموجود الذي كان يؤدي إلى صفحة 404.
- **إصلاح خطأ `TypeError: t2 is not a function` في صفحة التذاكر (`TicketsPage`)**:
  - تصحيح استدعاء دالة الترجمة `t` في قائمة التذاكر.

---

## 2026-09-10


### Fixed
- **إصلاح توجيه الروابط المباشرة لصفحة التطبيق (`https://tabibi.dz/app`) على الاستضافة**:
  - إضافة ملف قواعد التوجيه وإعادة الكتابة [`.htaccess`](file:///d:/Application%20Web/WebTabibi/frontend/public/.htaccess) لتوجيه المسارات المباشرة لـ React (SPA Fallback) بدلاً من ظهور خطأ 404 من خادم الويب (Apache / LiteSpeed).
  - تحديث معالج المسارات في [`frontend/src/hooks/useRoute.js`](file:///d:/Application%20Web/WebTabibi/frontend/src/hooks/useRoute.js) لدعم المسار النظيف `/app` وتوحيده مع `window.history` تلقائياً بسلاسة وبدون إعادة تحميل.

### Added
- **بناء وإصدار تطبيق الأندرويد بوضع الإنتاج (Android Release Build)**:
  - بناء وتجميع حزم الإنتاج الموقعة (Signed Production Builds) باستخدام مفتاح الشهادة المعتمد `tabibi-release.jks`.
  - توليد ملف APK الموقع جاهز للتثبيت والمشاركة: `frontend/android/app/build/outputs/apk/release/app-release.apk` (حجم ~14.7MB).
  - توليد ملف Android App Bundle (AAB) المعتمد للنشر المباشر على Google Play Store: `frontend/android/app/build/outputs/bundle/release/app-release.aab` (حجم ~14.5MB).
  - تعيين رابط التحميل المباشر للـ APK في صفحة التطبيق إلى الرابط المباشر السريع: `https://stellarsoft.dz/download/tabibi.apk`.
  - إعداد ملف `local.properties` لربط حزم الـ Android SDK تلقائياً.
- **إنشاء صفحة تطبيق طبيبي (`/app` و `https://tabibi.dz/app`)**:
  - إنشاء مكون صفحة التطبيق الكاملة [`frontend/src/pages/AppDownload.jsx`](file:///d:/Application%20Web/WebTabibi/frontend/src/pages/AppDownload.jsx) بتصميم Glassmorphism وتدرجات ألوان طبية عصرية وتأثيرات `framer-motion`.
  - توفير أزرار تحميل ثلاثية:
    1. **تحميل مباشر APK (Direct APK Download)** لأجهزة أندرويد مع تفاصيل الحجم والإصدار.
    2. **زر Google Play** الرسمي.
    3. **زر Apple App Store** لأجهزة iOS.
  - إضافة رمز استجابة سريعة تفاعلي (QR Code) لمسح الرمز وتثبيت التطبيق من الهاتف مباشرة.
  - معرض تفاعلي لواجهات وشاشات التطبيق (البحث، حجز المواعيد الفوري، التنبيهات والمحادثة، والملف العائلي الموحد) داخل إطار هاتف ذكي ثلاثي الأبعاد.
  - قسم المميزات والخصائص الشاملة، دليل التثبيت السهل خطوة بخطوة، بطاقة المواصفات التقنية، وقسم الأسئلة الشائعة (FAQ Accordion).
  - تحديث موجه المسارات في [`frontend/src/hooks/useRoute.js`](file:///d:/Application%20Web/WebTabibi/frontend/src/hooks/useRoute.js) لدعم المسار المباشر `/app` و `/#/app`.
  - إضافة روابط سريعة في شريط التنقل العلوي (`Navbar`) والفوتر (`Footer`) في [`frontend/src/App.jsx`](file:///d:/Application%20Web/WebTabibi/frontend/src/App.jsx).
  - إضافة الترجمات الكاملة باللغات الثلاث (العربية، الفرنسية، والإنجليزية) في `ar.json`, `fr.json`, `en.json`.

---

## 2026-09-06

### Fixed
- **إصلاح خطأ `ReferenceError: ShieldCheck is not defined` في صفحة البحث**:
  - تم استيراد أيقونة `ShieldCheck` المفقودة من مكتبة `lucide-react` في ملف المكونات المشتركة [`SharedUI.jsx`](file:///d:/Application%20Web/WebTabibi/frontend/src/components/SharedUI.jsx) داخل مكون شارة التوثيق `VerifiedBadge`.
  - سبب ظهور الخطأ على الاستضافة فقط: عند البحث على الاستضافة، ترجع النتائج عيادات ومراكز طبية (`ResultType !== 'DOCTOR'`)، مما يفعّل عرض شارة التوثيق `VerifiedBadge` التي تستدعي `ShieldCheck`. أما محلياً إذا كانت النتائج لا تحتوي إلا على أطباء، فإن شرط عرض الشارة لا يتحقق فلا يُستدعى المكون.
- **إصلاح أيقونات ومتغيرات مفقودة أخرى**:
  - إضافة استيراد أيقونات `Mail`, `Clock`, `CreditCard` من `lucide-react` في ملف [`Search.jsx`](file:///d:/Application%20Web/WebTabibi/frontend/src/pages/Search.jsx).
  - إضافة `useTranslation` داخل مكون `AdminDashboardPage` في [`App.jsx`](file:///d:/Application%20Web/WebTabibi/frontend/src/App.jsx) لتوفير كائن `i18n`.
  - جعل استدعاء `window.crypto` آمناً في [`analytics.js`](file:///d:/Application%20Web/WebTabibi/frontend/src/utils/analytics.js).
  - تعديل رسالة شاشة الخطأ العامة في `ErrorBoundary` لتكون ملائمة لجميع المنصات (الويب والموبايل).

### Files Changed
- frontend/src/components/SharedUI.jsx
- frontend/src/pages/Search.jsx
- frontend/src/App.jsx
- frontend/src/utils/analytics.js
- Docs/CHANGELOG.md

---

### Added / Modified
- **تحديث وإعادة هيكلة جدول التخصصات الطبية (`specialties`)**:
  - تنظيف وتوحيد قائمة التخصصات إلى 27 تخصصاً معيارياً شاملاً لجميع فروع الطب البشري وطب وجراحة الأسنان والصيدلة.
  - إدخال التسميات الدقيقة باللغتين العربية والفرنسية (`namear`, `namefr`).
  - تحديث معالجة استبعاد التخصصات في الواجهة الأمامية (`frontend/src/api/client.js`) لتمكين عرض التخصصات المعيارية بالكامل.
- **إضافة مبررات وأسباب الزيارات الطبية (`reasons`)**:
  - توسيع جدول `reasons` لدعم التعدد اللغوي بإضافة أعمدة `namear` و `namefr`.
  - إدراج 716 سبباً ومبرراً استشارياً معيارياً موزعة على الـ 27 تخصصاً طبياً مع ترجماتها الدقيقة.
- **استيراد وتوليد حسابات الأطباء من ملف البيانات (`doctors_data.xlsx`)**:
  - استيراد 20,178 سجلاً للأطباء مع مطابقة التخصصات والولايات والبلديات في الجزائر.
  - إنشاء وتوليد حساب مستخدم عشوائي مشفر وفريد في جدول `users` لكل طبيب مستورد بنوع `usertype = 1` لتأمين الوصول لمنصة الأطباء.
  - ربط الطبيب بحسابه في جدول `users` عبر المفتاح الخارجي `user_id`.

- **مزامنة بيانات التخصصات والأسباب في تطبيق دلفي (`uCreateDatabase.pas`)**:
  - تحديث دالة `TDBCreator.InsertData` في ملف [`D:\Delphi\programs\Clinic\uCreateDatabase.pas`](file:///D:/Delphi/programs/Clinic/uCreateDatabase.pas) لتتطابق تماماً مع بيانات التخصصات (27 تخصصاً) والأسباب (716 سبباً) الموجودة على الاستضافة.
  - الالتزام التام بالمخطط الأصلي لجداول دلفي دون إضافة أي حقول إضافية أو قيود مرجعية جديدة:
    - جدول `Specialties`: إدراج الحقول الأصلية فقط (`ID`, `NameAr`, `NameFr`).
    - جدول `Reasons`: إدراج الحقول الأصلية فقط (`ID`, `Name`).

### Files Changed
- D:\Delphi\programs\Clinic\uCreateDatabase.pas
- backend/sql/update_specialties.sql
- backend/sql/insert_reasons.sql
- backend/sql/import_doctors.sql
- frontend/src/api/client.js
- Docs/DATABASE.md
- Docs/CHANGELOG.md

### Documentation Updated
- Yes (`Docs/DATABASE.md`, `Docs/CHANGELOG.md`)

---

## 2026-09-03 (3)

### Changed / Improved
- **إيقاف ميزة التحقق من الهاتف برمز OTP**: تم إيقاف وتعطيل طلب رمز التحقق لأرقام الهواتف عبر النظام كاملاً في الواجهة الخلفية والأمامية (`VerificationController`, `App.jsx`, `Profile.jsx`).
- **تأكيد رقم الهاتف تلقائياً فور الإدخال**: تعيين قيمة `phonevalidation = 1` تلقائياً لكل رقم هاتف يتم إدخاله في أي مكان (تسجيل المرضى، تسجيل Google، تسجيل وتحديث الأطباء والعيادات، وتعديل الملفات الشخصية).
- **منع تكرار رقم الهاتف الصارم**: تعزيز التحقق من عدم تكرار أرقام الهواتف عبر فحص جميع الجداول (`patients`, `doctors`, `clinics`, `doctorregistrations`, `clinicregistrations`) بواسطة `UserValidationHelper::isPhoneDuplicate` بعد توحيد الصيغ وحذف الرموز والشرطات.
- **تحديث السجلات الحالية في قاعدة البيانات**: ترقية جميع سجلات المرضى والأطباء والعيادات التي تحتوي على أرقام هواتف لتكون مؤكدة (`phonevalidation = 1`).

### Files Changed
- backend/helpers/UserValidationHelper.php
- backend/controllers/PatientController.php
- backend/controllers/DoctorController.php
- backend/controllers/ClinicController.php
- backend/controllers/AuthController.php
- backend/controllers/AdminController.php
- backend/controllers/VerificationController.php
- frontend/src/App.jsx
- frontend/src/pages/Profile.jsx
- Docs/BUSINESS_RULES.md
- Docs/CHANGELOG.md

### Documentation Updated
- Yes (`Docs/BUSINESS_RULES.md`, `Docs/CHANGELOG.md`)

---

## 2026-09-03 (2)

### Added
- إضافة ميزة إرسال بريد إلكتروني تلقائي واحترافي عبر SMTP يتضمن بيانات الدخول (اسم المستخدم، البريد الإلكتروني، كلمة المرور، ورابط تسجيل الدخول) إلى الطبيب أو العيادة فور قبول طلب التسجيل من قِبل المطور/الأدمن في لوحة التحكم (`AdminController`).
- إضافة دالة `EmailHelper::sendApprovalCredentials` وقالب بريد HTML متجاوب (`buildApprovalCredentialsTemplate`) بتصميم متناسق يدعم اللغتين العربية والفرنسية، مع إبراز بيانات تسجيل الدخول وتنبيهات أمان الحساب وزر الدخول المباشر.

### Files Changed
- backend/helpers/EmailHelper.php
- backend/controllers/AdminController.php
- Docs/BUSINESS_RULES.md
- Docs/CHANGELOG.md

### Documentation Updated
- Yes (`Docs/BUSINESS_RULES.md`, `Docs/CHANGELOG.md`)

---

## 2026-09-03

### Added / Modified
- إعداد وتحديث حساب المطور ومدير النظام (Admin / Developer) في قاعدة البيانات ببيانات الاعتماد:
  - اسم المستخدم: `admin`
  - كلمة المرور: `amar1990` (مُشفرة بنظام Base64 المعتمد في المشروع)
  - الصلاحية: `usertype = 3` (مدير نظام / مطور بكامل الصلاحيات ولوحة التحكم)
- إبطال الجلسات السابقة لحساب الأدمن لضمان تفعيل كلمة المرور الجديدة فوراً.
- تحديث التوثيق في دليل التثبيت `Docs/SETUP_GUIDE.md`.

### Files Changed
- Docs/SETUP_GUIDE.md
- Docs/CHANGELOG.md

### Documentation Updated
- Yes (`Docs/SETUP_GUIDE.md`, `Docs/CHANGELOG.md`)

---

## 2026-06-20

### Added
- إضافة قسم جديد "إحصائيات زيارات الموقع" في لوحة تحكم الإدارة (`AdminDashboardPage`).
- يعرض القسم عدد الزيارات (اليومية، الأسبوعية، الشهرية، الإجمالية) والزيارات مقسمة حسب الدولة والولاية/المنطقة.
- إضافة جدول جديد `site_visits` في قاعدة البيانات وتسجيل الزيارات باستخدام عنوان الـ IP والبيانات الجغرافية.
- إضافة نقطة وصول جديدة في الخادم `POST /api/visits` لتسجيل الزيارات بشكل سري و `GET /api/admin/stats` تم تحديثها لجلب الإحصائيات.

### Files Changed
- backend/index.php
- backend/controllers/PublicController.php
- backend/controllers/AdminController.php
- frontend/src/App.jsx
- Docs/DATABASE.md
- Docs/API.md

### Documentation Updated
- Yes (`Docs/DATABASE.md`, `Docs/API.md`, `Docs/CHANGELOG.md`)

---

## 2026-06-15

### Added
- إضافة ميزة تسمح للمريض بتغيير اسم المستخدم (username) وكلمة المرور (password) من صفحة الملف الشخصي.
- إضافة قسم جديد "بيانات الدخول" في واجهة المستخدم `Profile.jsx` مع دعم التحقق الكامل من التطابق وصحة البيانات.
- إضافة نقطة وصول جديدة في الخادم `PUT /api/patients/credentials` لمعالجة التغييرات (تم إزالة شرط إدخال كلمة المرور الحالية بناءً على طلب المستخدم).
- إضافة ترجمات للواجهة الجديدة باللغات الثلاث (عربي، فرنسي، إنجليزي).

### Files Changed
- backend/index.php
- backend/controllers/PatientController.php
- frontend/src/api/client.js
- frontend/src/pages/Profile.jsx
- frontend/src/locales/ar.json
- frontend/src/locales/fr.json
- frontend/src/locales/en.json

### Documentation Updated
- Yes (`Docs/API.md`, `Docs/CHANGELOG.md`)

---

## 2026-06-13 (4)

### Fixed
- إصلاح عدم وصول رمز OTP للبريد الإلكتروني عند إنشاء حساب جديد.
- السبب: دالة `sendOTP` كانت مفقودة تماماً في `EmailHelper.php`، مما جعل الكود يسقط إلى الـ `@mail()` الاحتياطي الذي لا يعمل على بيئة Windows المحلية.
- تم إضافة الدالة `sendOTP` ودالة مساعدة `buildOTPTemplate` في `EmailHelper.php` للإرسال عبر SMTP (Gmail) بقالب HTML احترافي.

### Files Changed
- backend/helpers/EmailHelper.php

### Documentation Updated
- Yes (`Docs/CHANGELOG.md`)

---

## 2026-06-13 (3)

### Fixed
- إصلاح خطأ `syntax error, unexpected token "public"` في الباك إند عند محاولة تسجيل حساب جديد.
- تم إزالة حلقة `foreach` غير المكتملة في دالة `register` داخل `AuthController.php` التي كانت تتسبب في خطأ برمجي يؤثر على الدالة التي تليها `registerConfirm`.

### Files Changed
- backend/controllers/AuthController.php

### Documentation Updated
- Yes (`Docs/CHANGELOG.md`)

---

## 2026-06-13 (2)
### Fixed
- إصلاح خطأ `ReferenceError: registerConfirm is not defined` الذي يظهر عند فتح نافذة تسجيل حساب جديد.
- تم التعديل على المكون `MainApp` لاستخراج الدالة `registerConfirm` من الهوك `useAuth()` الذي كان يتسبب في توقف التطبيق عند التوجيه إلى `/register`.

### Files Changed
- frontend/src/App.jsx

### Documentation Updated
- Yes (`Docs/CHANGELOG.md`)

---

## 2026-06-13
### Added
- إضافة نظام التحقق التلقائي من البريد الإلكتروني عند تسجيل الدخول لحسابات المرضى والأطباء والعيادات.
- عند محاولة تسجيل الدخول بحساب غير مؤكد الإيميل (`emailvalidation = 0`):
  - يقوم الخادم تلقائياً بتوليد وإرسال رمز تحقق OTP مكون من 6 أرقام إلى إيميل المستخدم.
  - إرجاع استجابة `403 Forbidden` تحتوي على المعطيات المساعدة `requires_verification` والإيميل لتوجيه الواجهة الأمامية.
- إضافة دالة `verifyAccountEmail` في كلاس `AuthController` للتحقق من الرمز المدخل وتحديث حالة البريد الإلكتروني إلى مؤكد (`emailvalidation = 1`).

### Modified
- تعديل الواجهة الأمامية (`LoginPage` المدمجة في `App.jsx` والمنفصلة في `pages/Login.jsx`) لالتقاط خطأ `requires_verification` وعرض واجهة إدخال رمز OTP مباشرة.
- تعديل واجهة OTP لدعم إعادة إرسال الرمز تلقائياً عند طلب المستخدم، والعودة إلى شاشة تسجيل الدخول العادية.
- تسجيل الدخول التلقائي للمستخدم بعد إدخال رمز التحقق بنجاح لضمان تجربة مستخدم سلسة وسريعة.
- تعديل دوال طلبات الـ HTTP (`req` في `App.jsx` و `request` في `client.js`) لربط خصائص استجابة الخطأ بكائن الـ `Error` الملقى.

### Files Changed
- backend/controllers/AuthController.php
- frontend/src/App.jsx
- frontend/src/pages/Login.jsx
- frontend/src/api/client.js

### Documentation Updated
- Yes (`Docs/CHANGELOG.md`, `Docs/BUSINESS_RULES.md`)

---

## 2026-06-12 (2)

### Modified
- تحويل زر الجرس 🔔 في شريط التنقل الرئيسي (`App.jsx` → `Navbar`) من زر يُطلق toast بسيط إلى قائمة منسدلة كاملة لعرض الإشعارات.

### Added
- إضافة نقاط وصول `api.notifications` في كائن الـ API داخل `App.jsx` لدعم العمليات:
  - `GET /notifications` — جلب قائمة الإشعارات
  - `PUT /notifications/:id/read` — تحديد إشعار كمقروء
  - `PUT /notifications/read-all` — تحديد جميع الإشعارات كمقروءة
  - `DELETE /notifications/:id` — حذف إشعار
- إضافة حالات React جديدة في `Navbar`: `notifOpen`, `notifications`, `notifRef`
- إضافة استدعاء تلقائي للإشعارات كل 15 ثانية عند تسجيل الدخول
- إضافة عداد (badge) أحمر فوق زر الجرس يُظهر عدد الإشعارات غير المقروءة
- القائمة المنسدلة تتضمن: رأس مع عنوان وعداد، زر "تحديد الكل كمقروء"، قائمة إشعارات مع نقطة حالة القراءة، تاريخ التنبيه، وزر حذف لكل إشعار
- حالة فارغة جميلة (Empty state) عند عدم وجود إشعارات
- دعم RTL كامل (عربي/فرنسي/إنجليزي)
- تأثيرات الدخول/الخروج بـ `AnimatePresence` و `motion.div`
- إغلاق القائمة عند الضغط خارجها

### Files Changed
- frontend/src/App.jsx

### Documentation Updated
Yes (`Docs/CHANGELOG.md`)

---

## 2026-06-12

### Added
- إضافة نظام التنبيهات الفوري والمستمر (Real-time notifications dropdown list) في القائمة العلوية للتطبيق (Navbar) والذي يعمل عن طريق الاستعلام المتكرر (polling) كل 15 ثانية لجلب التنبيهات الجديدة تلقائياً بدون إعادة تحميل الصفحة.
- إضافة جدول التنبيهات `notifications` في قاعدة البيانات مع دعم المهاجرة التلقائية (auto-migration) بمجرد الاتصال بالقاعدة لتسهيل التثبيت والتوافق مع بيئة Windows وDelphi.
- إضافة كلاس المساعد `NotificationHelper.php` لإنشاء وإرسال التنبيهات برمجياً.
- إضافة كلاس المتحكم `NotificationController.php` لمعالجة طلبات جلب، قراءة، وحذف التنبيهات.
- إضافة نقاط وصول جديدة في ملف التوجيه `index.php` للمسارات:
  - `GET /api/notifications`
  - `PUT /api/notifications/:id/read`
  - `PUT /api/notifications/read-all`
  - `DELETE /api/notifications/:id`
- ربط أحداث النظام بالتنبيهات:
  - إرسال تنبيه للطبيب والعيادة عند حجز موعد جديد من قبل المريض.
  - إرسال تنبيه للمريض عند تغيير الطبيب لحالة الموعد (تأكيد، إتمام، أو إلغاء).
  - إرسال تنبيه للطبيب والعيادة عند إلغاء المريض لموعده.
  - إرسال تنبيه للطبيب عند تلقي رسالة دردشة جديدة من المريض.
- إضافة الترجمات اللازمة في ملفات اللغات الثلاثة (`ar.json`, `en.json`, `fr.json`).

### Files Changed
- backend/core/Database.php
- backend/helpers/NotificationHelper.php
- backend/controllers/NotificationController.php
- backend/controllers/AppointmentController.php
- backend/controllers/ChatController.php
- backend/index.php
- frontend/src/api/client.js
- frontend/src/components/Navbar.jsx
- frontend/src/locales/ar.json
- frontend/src/locales/en.json
- frontend/src/locales/fr.json

### Documentation Updated
Yes (`Docs/CHANGELOG.md`, `Docs/DATABASE.md`, `Docs/API.md`)

## 2026-06-11

### Added
- إضافة حقل "الرقم الوطني" (nin) في قاعدة البيانات وجداول (`patients`, `doctors`, `doctorregistrations`).
- إضافة حقل الرقم الوطني (National ID / NIN) في نماذج تسجيل المرضى (`Register.jsx`) وتسجيل الأطباء (`App.jsx`).
- إضافة إمكانية تعديل حقل الرقم الوطني في الصفحة الشخصية للمريض (`Profile.jsx`).
- إضافة الترجمات اللازمة للحقل في ملفات اللغات (`ar.json`, `en.json`, `fr.json`).

### Modified
- تعديل `App.jsx` لإظهار أرقام الولايات بجانب أسمائها في القائمة المنسدلة للبحث (مثلاً: "17 - الجلفة").
- تعديل `AuthController.php` و `PatientController.php` و `RegistrationController.php` و `DoctorController.php` لدعم استقبال وتخزين حقل الـ `nin`.

### Files Changed
- backend/controllers/AuthController.php
- backend/controllers/RegistrationController.php
- backend/controllers/PatientController.php
- backend/controllers/DoctorController.php
- frontend/src/pages/Register.jsx
- frontend/src/pages/Profile.jsx
- frontend/src/App.jsx
- frontend/src/locales/ar.json
- frontend/src/locales/en.json
- frontend/src/locales/fr.json

### Documentation Updated
Yes (`Docs/CHANGELOG.md`, `Docs/DATABASE.md`)

## 2026-06-10

### Fixed
- **إصلاح عدم ظهور زر تسجيل الدخول/إنشاء حساب بقوقل** في صفحتي Login و Register.
- السبب الجذري: كان `App.jsx` يحتوي على تعريفين داخليين لـ `LoginPage` و `RegisterPage` لا يتضمنان زر Google، وهما اللذان يُستخدمان فعلياً بواسطة الروتر — بينما الملفات الخارجية `src/pages/Login.jsx` و `src/pages/Register.jsx` (التي تحتوي على الزر) لم تكن مُستخدمة أبداً.

### Modified
- تعديل `LoginPage` الداخلي في `App.jsx` لإضافة منطق Google Sign-In (`googleBtnRef`, `initialized`, `useEffect`, `renderButton`).
- تعديل `RegisterPage` الداخلي في `App.jsx` بنفس الطريقة.
- تحديث signature الدوال لقبول `onGoogleLogin` كـ prop.

### Files Changed
- frontend/src/App.jsx

### Documentation Updated
Yes (`Docs/CHANGELOG.md`)

## 2026-06-08

### Added
- إضافة إمكانية تسجيل الدخول وإنشاء حساب عن طريق حساب قوقل مباشرة للمرضى باستخدام `Google Identity Services`.
- إضافة نقطة وصول جديدة في الخادم `/api/auth/google` لمعالجة الرمز السري `credential` المرسل من قوقل وإنشاء حساب تلقائياً إذا لم يكن موجوداً.

### Modified
- تعديل `index.html` في الواجهة الأمامية لإضافة سكريبت قوقل: `<script src="https://accounts.google.com/gsi/client" async defer></script>`.
- تعديل كلاس `AuthController.php` بإضافة دالة `google()`.
- تحديث ملف التوجيهات `index.php` لدعم المسار `/auth/google`.
- تحديث المكونات `Login.jsx` و `Register.jsx` لعرض زر "تسجيل الدخول عبر قوقل".
- تحديث `App.jsx` لتمرير الـ `googleLogin` للمكونات السابقة.

### Files Changed
- frontend/index.html
- frontend/src/App.jsx
- frontend/src/pages/Login.jsx
- frontend/src/pages/Register.jsx
- backend/index.php
- backend/controllers/AuthController.php

### Documentation Updated
Yes (`Docs/API.md`)
