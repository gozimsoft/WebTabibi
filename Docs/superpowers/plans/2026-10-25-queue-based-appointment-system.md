# خطة تنفيذ نظام حجز المواعيد المزدوج (بالتوقيت أو بالأرقام والقوائم) والتكامل مع Tabibi_Rect

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** بناء وتفعيل نظام حجز وإدارة المواعيد المزدوج في `WebTabibi` وتهيئته لـ `Tabibi_Rect`؛ لتمكين الطبيب من اختيار العمل بنظام التوقيت الدقيق (Time-Slots) أو بنظام الأرقام والقوائم اليومية (Queue/Token Numbers) مع حساب وقت الحضور التقريبي ودعم قائمة واحدة أو قائمتين وحماية التزامن.

**Architecture:** توسيع جداول `doctorssettingapointements` و `apointements` بحقول الترقيم والفترات، وتطوير خوارزمية فحص الفترات وحساب التوقيت التقريبي في الـ Backend APIs مع تأمين أسبقية الحجز ومنع تكرار الأرقام عبر Transactions وقفل السجلات، وتطوير واجهات الطبيب (الإعدادات وغرفة عمليات الطابور الحي) وواجهات المريض (بطاقات الفترات والتذكرة الرقمية وتتبع الدور الحي).

**Tech Stack:** PHP (Vanilla PDO backend), MySQL/MariaDB, React 18 (Vite, CSS Modules / Vanilla CSS).

**Spec:** [`Docs/superpowers/specs/2026-10-25-queue-based-appointment-system-design.md`](file:///d:/Application%20Web/WebTabibi/Docs/superpowers/specs/2026-10-25-queue-based-appointment-system-design.md)

## Global Constraints

- **التوافق العكسي التام (100% Backward Compatibility)**: لا يجوز كسر أي تدفق للأطباء العاملين بنظام التوقيت `booking_mode = 0`.
- **حظر تعديل `.gitignore`**: ملف `.gitignore` في جذر المشروع محمي وممنوع المساس به إطلاقاً (وفقاً لـ `AI_WORKFLOW_RULES.md`).
- **أسبقية الحجز المشتركة**: قائمة الأرقام موحدة تصاعدياً وتتشارك بين المنصة والمكتب دون تكرار للأرقام.
- **ثبات التذاكر الصادرة**: إلغاء أي تذكرة لا يغير أرقام المرضى الآخرين.
- **التوثيق الإلزامي**: تحديث ملفات `Docs/CHANGELOG.md` و `DATABASE.md` و `API.md` و `BUSINESS_RULES.md` عند الانتهاء.

## Review Focus

1. **Race Conditions في حجز التذكرة**: عند ضغط مريضين على الحجز في نفس اللحظة، لا يحصلان على نفس الرقم بفضل `FOR UPDATE`.
2. **سقف القائمة وتجاوز الطوارئ**: رفض الحجز عند اكتمال السعة (مثلاً 25/25)، مع السماح للطبيب بإضافة حالة طارئة (`is_emergency = 1`).
3. **التاريخ والوقت في `apointementdate`**: الحفاظ على تاريخ ووقت الموعد التقديري في `apointementdate` لضمان عمل الفلترة اليومية والفرز.
4. **التبديل بين الفترات (صباحي/مسائي)**: عزل سعة وأرقام الفترة الصباحية عن الفترة المسائية في حال تفعيل القائمتين.
5. **سلامة الأطباء القدامى**: التأكد من أن الطبيب الذي لم يغير إعداداته يظل يرى جدول الساعات القديم ويعمل نظامه دون أي خطأ 500.

---

### Task 1: سكريبتات قاعدة البيانات والترحيل والتثبيت الأولي لـ Tabibi_Rect

**Files:**
- Create: `backend/sql/queue_booking_migration.sql`
- Create: `backend/sql/init_clinic_installer_schema.sql`
- Create: `scratch/apply_queue_migration.php`

**Interfaces:**
- Produces: أعمدة `booking_mode`, `shift_mode`, `morning_*`, `evening_*`, `allow_overbooking` في `doctorssettingapointements`.
- Produces: أعمدة `token_number`, `shift_type`, `estimated_time`, `is_emergency`, `queue_status` في `apointements`.

- [ ] **Step 1: كتابة ملف الترحيل `backend/sql/queue_booking_migration.sql`**
  كتابة أوامر `ALTER TABLE` مع فحص التحقق لعدم تكرار إضافة الأعمدة إذا كانت موجودة مسبقاً.

- [ ] **Step 2: كتابة ملف الإنشاء الأولي `backend/sql/init_clinic_installer_schema.sql`**
  تضمين استعلامات `CREATE TABLE IF NOT EXISTS` المحدثة والمعدة للنسخ المباشر داخل كود نافذة إعدادات الاتصال في `Tabibi_Rect`.

- [ ] **Step 3: كتابة وتشغيل سكريبت تطبيق الترحيل `scratch/apply_queue_migration.php`**
  تنفيذ الترحيل على قاعدة البيانات المحلية للتأكد من نجاح إنشاء وتعديل الحقول.

- [ ] **Step 4: التحقق من بنية الجداول**
  تشغيل فحص `SHOW COLUMNS` والتأكد من وجود كافة الحقول الجديدة مع أنواعها وقيمها الافتراضية.

- [ ] **Step 5: Commit**
  `git add backend/sql/ Docs/superpowers/plans/ ; git commit -m "feat(db): add queue-based booking schema and migration scripts"`

---

### Task 2: تحديث Backend Controller لإعدادات المواعيد (`DoctorController.php`)

**Files:**
- Modify: `backend/controllers/DoctorController.php:330-370` (حفظ الإعدادات الافتراضية والجديدة)
- Modify: `backend/controllers/DoctorController.php:520-670` (`getAppointmentSettings`, `createAppointmentSetting`, `updateAppointmentSetting`)
- Test: `scratch/test_doctor_queue_settings.php`

**Interfaces:**
- Consumes: حقول `booking_mode`, `shift_mode`, `morning_start`, `morning_end`, `morning_capacity`, `evening_start`, `evening_end`, `evening_capacity`, `allow_overbooking` من مدخلات الـ JSON.
- Produces: استجابة موحدة تحتوي على هذه الإعدادات عند طلب `GET /doctors/appointment-settings`.

- [ ] **Step 1: كتابة اختبار التحقق `scratch/test_doctor_queue_settings.php`**
  إنشاء اختبار يحاكي استدعاء الـ API لتعديل إعدادات الطبيب لنظام الأرقام وقراءة النتيجة.

- [ ] **Step 2: تشغيل الاختبار للتحقق من فشله قبل التعديل**

- [ ] **Step 3: تعديل دوال إعدادات المواعيد في `DoctorController.php`**
  - دعم استقبال الحقول الجديدة وتنظيفها وحفظها مع القيم الافتراضية.
  - إرجاع الحقول الجديدة مع التنسيق المناسب في `getAppointmentSettings`.

- [ ] **Step 4: إعادة تشغيل الاختبار والتأكد من نجاحه (PASS)**

- [ ] **Step 5: Commit**
  `git add backend/controllers/DoctorController.php ; git commit -m "feat(api): support queue and shifts in doctor appointment settings"`

---

### Task 3: خوارزمية استعلام الفترات وحساب الوقت التقريبي (`AppointmentController::getAvailableSlots`)

**Files:**
- Modify: `backend/controllers/AppointmentController.php:330-445`
- Test: `scratch/test_available_slots_algorithm.php`

**Interfaces:**
- Consumes: `GET /appointments/available-slots?clinics_doctor_id=...&date=YYYY-MM-DD`
- Produces: إذا `booking_mode == 0`: مصفوفة `slots: ["08:30", ...]`.
- Produces: إذا `booking_mode == 1`: كائن `shifts: [...]` مع `booked_count`, `remaining`, `next_token`, `estimated_time_for_next`.

- [ ] **Step 1: كتابة اختبار السلوك `scratch/test_available_slots_algorithm.php`**
  فحص حالتين: (1) طبيب بنظام التوقيت يرجع أوقاتاً عادية، (2) طبيب بنظام الأرقام يرجع الفترات والأرقام المحسوبة بدقة.

- [ ] **Step 2: تشغيل الاختبار للتحقق من النتيجة قبل التعديل**

- [ ] **Step 3: تطوير منطق `getAvailableSlots` في `AppointmentController.php`**
  - استخراج إعدادات الطبيب والتحقق من `booking_mode`.
  - في حال نظام الأرقام: فحص يوم الدوام، فحص فترات الراحة/العطل، حساب التذاكر النشطة لكل فترة (`shift_type`), حساب المقاعد المتبقية والرقم الموالي والوقت التقديري بالمعادلة: $\text{Shift Start} + (N-1) \times \text{timescale}$.

- [ ] **Step 4: إعادة تشغيل الاختبار والتأكد من نجاحه**

- [ ] **Step 5: Commit**
  `git add backend/controllers/AppointmentController.php ; git commit -m "feat(api): implement queue slots and estimated time algorithm"`

---

### Task 4: تنفيذ الحجز الذري وحماية سقف القائمة والأسبقية (`AppointmentController::book`)

**Files:**
- Modify: `backend/controllers/AppointmentController.php:446-590`
- Test: `scratch/test_queue_booking_concurrency.php`

**Interfaces:**
- Consumes: `POST /appointments` مع `shift_type` و `is_emergency` و `clinics_doctor_id` و `date`.
- Produces: تذكرة موعد مؤكدة برقم `token_number` ووقت `estimated_time`، أو رد `409 Conflict` عند اكتمال السعة.

- [ ] **Step 1: كتابة اختبار التحقق `scratch/test_queue_booking_concurrency.php`**
  اختبار حجز تذاكر متتالية، التحقق من تصاعد الأرقام (1، 2، 3)، التحقق من حظر الحجز فوق السعة، واختبار تجاوز السقف للطوارئ.

- [ ] **Step 2: تشغيل الاختبار والتأكد من السلوك الأولي**

- [ ] **Step 3: تعديل دالة `book()` في `AppointmentController.php`**
  - تمييز نمط حجز الطبيب (`booking_mode`).
  - في نمط الأرقام: استخدام Transaction مع قفل ذري `FOR UPDATE` لقراءة آخر رقم والعدد الإجمالي للفترة.
  - التحقق من السعة: منع الحجز عند الامتلاء إلا إذا كانت `is_emergency = 1`.
  - توليد `token_number` و `estimated_time` وحفظ التذكرة مع الحفاظ على `apointementdate` بتاريخ ووقت الموعد التقديري.

- [ ] **Step 4: تشغيل الاختبار والتأكد من نجاح كافة الحالات (PASS)**

- [ ] **Step 5: Commit**
  `git add backend/controllers/AppointmentController.php ; git commit -m "feat(api): add atomic queue booking and capacity protection"`

---

### Task 5: إدارة الطابور الحي وتحديث الحالات ونقطة شاشة الانتظار (`live-queue-status`)

**Files:**
- Modify: `backend/controllers/AppointmentController.php` (إضافة `updateQueueStatus`, `getLiveQueueStatus`, وتحسين `getForManager`)
- Modify: `backend/index.php` (ربط المسارات الجديدة)
- Test: `scratch/test_live_queue_apis.php`

**Interfaces:**
- Produces: `PUT /appointments/:id/queue-status` لتحديث حالة المريض (`waiting`, `in_consultation`, `completed`, `absent`).
- Produces: `GET /appointments/live-queue-status?clinics_doctor_id=...&shift_type=...` لشاشة التلفاز والمريض.

- [ ] **Step 1: كتابة اختبار التحقق `scratch/test_live_queue_apis.php`**
  اختبار تغيير حالة التذكرة إلى `in_consultation` وقراءة `live-queue-status` والتأكد من ظهور المريض كرقم حالي.

- [ ] **Step 2: تشغيل الاختبار للتحقق**

- [ ] **Step 3: كتابة دوال `updateQueueStatus` و `getLiveQueueStatus` وربطها في `index.php`**

- [ ] **Step 4: إعادة تشغيل الاختبار والتأكد من نجاحه**

- [ ] **Step 5: Commit**
  `git add backend/controllers/AppointmentController.php backend/index.php ; git commit -m "feat(api): add live queue management and TV display status endpoints"`

---

### Task 6: واجهة إعدادات مواعيد الطبيب في الواجهة الأمامية (`DoctorAppointmentSettings.jsx`)

**Files:**
- Modify: `frontend/src/components/DoctorAppointmentSettings.jsx`
- Modify: `frontend/src/locales/` أو نصوص الترجمة العربية/الفرنسية إن لزم.

**Interfaces:**
- Consumes: بيانات الإعدادات الموسعة من `api.doctor.getAppointmentSettings()`.
- Produces: واجهة تبديل تفاعلية بين نمط الساعات ونمط الأرقام، مع حقول الفترات الصباحية والمسائية والسعات.

- [ ] **Step 1: إضافة حالة النموذج (State) والخيارات الجديدة في `DoctorAppointmentSettings.jsx`**
  إضافة `booking_mode`, `shift_mode`, `morning_start`, `morning_end`, `morning_capacity`, `evening_start`, `evening_end`, `evening_capacity`, `allow_overbooking`.

- [ ] **Step 2: بناء واجهة التبديل المرئية (Tabs / Mode Switcher)**
  عرض بطاقات اختيار النمط (نظام الساعات / نظام الأرقام والقوائم).

- [ ] **Step 3: بناء حقول تخصيص الفترات الصباحية والمسائية والسعات ومعدل الفحص**

- [ ] **Step 4: اختبار بناء الواجهة الأمامية والتحقق من عدم وجود أخطاء صياغة**
  `npm run build` في مجلد `frontend`.

- [ ] **Step 5: Commit**
  `git add frontend/src/components/DoctorAppointmentSettings.jsx ; git commit -m "feat(ui): add dual booking mode controls in doctor settings"`

---

### Task 7: لوحة إدارة الطابور الحي للطبيب والعيادة (`AppointmentManager.jsx`)

**Files:**
- Modify: `frontend/src/pages/AppointmentManager.jsx`
- Modify: `frontend/src/pages/ClinicAppointmentManager.jsx` (إذا لزم للعيادة)

**Interfaces:**
- Consumes: بيانات المواعيد مع `booking_mode` و `token_number` و `queue_status` و `estimated_time`.
- Produces: لوحة تحكم الطابور الحي: بطاقة "الدور الحالي"، زر "مناداة المريض التالي"، جدول التذاكر المرتب، أزرار تسجيل مريض بالاستقبال (Walk-in)، وإضافة حالة طارئة.

- [ ] **Step 1: فحص نمط الطبيب وعرض شريط الطابور التفاعلي (Live Queue Banner)**
  إظهار رقم المريض الحالي وزر النداء السريع.

- [ ] **Step 2: تعديل جدول العرض ليدعم عرض أرقام التذاكر والأوقات التقديرية وحالة الطابور**

- [ ] **Step 3: إضافة نافذة التسجيل الفوري لمكتب الاستقبال (Walk-in Desk Modal) وزر الحالة الطارئة**

- [ ] **Step 4: فحص بناء الـ Frontend وتجربة التفاعل**
  `npm run build` في مجلد `frontend`.

- [ ] **Step 5: Commit**
  `git add frontend/src/pages/AppointmentManager.jsx ; git commit -m "feat(ui): implement live queue manager desk for doctors"`

---

### Task 8: تجربة المريض في الحجز ومتابعة دوره (`Book.jsx` و `Appointments.jsx`)

**Files:**
- Modify: `frontend/src/pages/Book.jsx`
- Modify: `frontend/src/pages/Appointments.jsx`

**Interfaces:**
- Consumes: استجابة `available-slots` بنمط `shifts`.
- Produces: بطاقات اختيار الفترة (صباحية/مسائية) مع المقاعد المتبقية ورقم التذكرة القادم والوقت التقريبي.
- Produces: بطاقة تذكرة رقمية كاملة فور التأكيد.
- Produces: مؤشر متابعة الدور الحي في صفحة المواعيد.

- [ ] **Step 1: تعديل `Book.jsx` لعرض بطاقات الفترات عند تفعيل نظام الأرقام**
  إظهار السعة والمتبقي ووقت الكشف التقديري وإيقاف الحجز عند اكتمال القائمة.

- [ ] **Step 2: إضافة بطاقة التذكرة الرقمية الفورية عند نجاح الحجز**

- [ ] **Step 3: تعديل `Appointments.jsx` لإظهار رقم التذكرة والمؤشر الحي للدور الحالي**

- [ ] **Step 4: فحص بناء الـ Frontend والتأكد من خلوه من الأخطاء**
  `npm run build` في مجلد `frontend`.

- [ ] **Step 5: Commit**
  `git add frontend/src/pages/Book.jsx frontend/src/pages/Appointments.jsx ; git commit -m "feat(ui): enhance patient booking with queue tickets and live tracker"`

---

### Task 9: تحديث التوثيق وسجل التغييرات (`AI_WORKFLOW_RULES.md`)

**Files:**
- Modify: `Docs/CHANGELOG.md`
- Modify: `Docs/DATABASE.md`
- Modify: `Docs/API.md`
- Modify: `Docs/BUSINESS_RULES.md`

**Interfaces:**
- Produces: توثيق دقيق وشامل لكافة التعديلات المعمارية وقواعد العمل ونقاط النهاية وجداول قاعدة البيانات.

- [ ] **Step 1: تحديث `Docs/DATABASE.md` بالجداول والأعمدة الجديدة**

- [ ] **Step 2: تحديث `Docs/API.md` بنقاط النهاية والمعاملات الجديدة**

- [ ] **Step 3: تحديث `Docs/BUSINESS_RULES.md` بقواعد نظام الأرقام وحماية التزامن**

- [ ] **Step 4: إضافة سجل مفصل في `Docs/CHANGELOG.md`**

- [ ] **Step 5: Commit**
  `git add Docs/ ; git commit -m "docs: update database, api, business rules and changelog for queue booking system"`
