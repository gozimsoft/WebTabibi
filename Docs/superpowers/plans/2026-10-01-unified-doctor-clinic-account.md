# خطة التنفيذ: توحيد حساب الطبيب وإدارة العيادة والمزامنة مع Tabibi_Rect
(Unified Doctor-Clinic Account Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** توحيد حساب الطبيب والعيادة في حساب واحد رئيسي، واقتصار التسجيل العام على الطبيب، وتمكين الطبيب من إنشاء وإدارة عيادته من لوحة تحكمه، ومطابقة البيانات تمهيداً للمزامنة مع برنامج `Tabibi_Rect`.

**Architecture:** 
- ربط العيادة مباشرة بالطبيب المالك عبر `owner_doctor_id` و `is_owner = 1` في `clinicsdoctors`.
- إزالة مسار تسجيل العيادة كحساب مستقل من الواجهات العامة مع توجيه الرابط القديم إلى تسجيل الطبيب.
- بناء واجهات و Endpoints متكاملة داخل حساب الطبيب لإنشاء العيادة وإدارتها وضبط أوقات عمله وعطله وأسعاره فيها، مع بوابة اعتماد من الإدارة.

**Tech Stack:** PHP 8.x (Backend Vanilla REST API), MySQL / MariaDB (Database), React 18 + Vite (Frontend), Lucide React (Icons).

**Spec:** [`docs/superpowers/specs/2026-10-01-unified-doctor-clinic-account-design.md`](file:///d:/Application%20Web/WebTabibi/docs/superpowers/specs/2026-10-01-unified-doctor-clinic-account-design.md)

## Global Constraints
- الاعتماد على حساب طبيب واحد فقط للممارس الصحي؛ عدم إنشاء أي حساب مستخدم (`users`) منفصل للعيادة.
- الحفاظ على استمرار عمل جداول `clinics` و `clinicsdoctors` لضمان عمل محرك البحث وحجز المواعيد وتقييمات العيادات بدون أي انكسار.
- العيادة المنشأة حديثاً من قبل الطبيب تبدأ بحالة `PENDING` حتى يعتمدها المشرف العام في لوحة الإدارة.
- فصل بيانات الطبيب الشخصية، وبيانات العيادة الثابتة، وبيانات دوام الطبيب وأسعاره في تلك العيادة.

## Review Focus
1. منع إنشاء أكثر من عيادة لنفس الطبيب ما لم تكن هناك صلاحية محددة.
2. التأكد من أن تعديل بيانات العيادة محمي ومحصور فقط بالطبيب المالك (`owner_doctor_id`).
3. التأكد من أن حجز المواعيد والبحث العام لا يعرضان العيادة إلا إذا كانت حالتها `APPROVED`.
4. التحقق من سلامة معالجة الشعار والبيانات النصية (تجنب ثغرات الحقن أو الرفع غير الآمن).
5. التحقق من أن توجيه `/register-clinic` في الواجهة الأمامية سلس ولا يتسبب في حلقة توجيه لا نهائية (Redirect Loop).

---

### Task 1: تعديل هيكل قاعدة البيانات (Database Schema Update)

**Files:**
- Create: `backend/sql/update_doctor_clinic_unified.sql`
- Modify: `backend/sql/lowercase_migration.sql` (توثيق)

**Interfaces:**
- Produces: 
  - `clinics.owner_doctor_id` (CHAR(36) NULL, INDEX)
  - `clinics.updatedat` (DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
  - `clinicsdoctors.is_owner` (TINYINT(1) DEFAULT 0)

- [ ] **Step 1: كتابة ملف SQL للترقية**
  إنشاء ملف `backend/sql/update_doctor_clinic_unified.sql` يحتوي على أوامر `ALTER TABLE` مع فحص وجود الأعمدة:
  ```sql
  -- إضافة معرف الطبيب المالك وحقل التحديث الزمني في جدول العيادات
  ALTER TABLE `clinics` 
    ADD COLUMN IF NOT EXISTS `owner_doctor_id` CHAR(36) NULL AFTER `user_id`,
    ADD COLUMN IF NOT EXISTS `updatedat` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `createdat`,
    ADD INDEX IF NOT EXISTS `idx_clinics_owner_doctor` (`owner_doctor_id`);

  -- إضافة عمود المالك في جدول ربط الأطباء بالعيادات
  ALTER TABLE `clinicsdoctors` 
    ADD COLUMN IF NOT EXISTS `is_owner` TINYINT(1) NOT NULL DEFAULT 0 AFTER `relationstatus`;
  ```

- [ ] **Step 2: تشغيل وترحيل التعديل على قاعدة البيانات المحلية**
  تنفيذ سكربت التعديل والتأكد من نجاحه بدون أخطاء.

- [ ] **Step 3: التحقق من وجود الأعمدة الجديدة**
  التحقق عبر استعلام فحص الأعمدة في `clinics` و `clinicsdoctors`.

- [ ] **Step 4: Commit**
  ```bash
  git add backend/sql/update_doctor_clinic_unified.sql
  git commit -m "db: add owner_doctor_id and is_owner for unified doctor-clinic architecture"
  ```

---

### Task 2: تعديل واجهات التسجيل الخلفية (Backend Registration Endpoint)

**Files:**
- Modify: `backend/controllers/RegistrationController.php:15-97`
- Modify: `backend/index.php`

**Interfaces:**
- Consumes: `POST /api/register/clinic`, `POST /api/register/doctor`
- Produces: تعطيل تسجيل العيادة المستقل مع رسالة إرشادية واضحة، والحفاظ على تسجيل الطبيب كبوابة وحيدة.

- [ ] **Step 1: تعديل دالة `registerClinic()` في `RegistrationController.php`**
  استبدال إنشاء حساب العيادة المستقل برسالة توجيهية:
  ```php
  public static function registerClinic(): void {
      Response::error('تم تحديث نظام طبيبي: لم يعد هناك حاجة لتسجيل حساب عيادة مستقل. يرجى تسجيل حسابك كطبيب من خلال رابط تسجيل الأطباء، وستتمكن من إنشاء عيادتك وإدارتها بالكامل من لوحة تحكمك.', 400);
  }
  ```

- [ ] **Step 2: اختبار الاستجابة لـ `POST /api/register/clinic`**
  إرسال طلب تجريبي والتأكد من استلام كود 400 والرسالة التوجيهية.

- [ ] **Step 3: Commit**
  ```bash
  git add backend/controllers/RegistrationController.php
  git commit -m "refactor(backend): retire standalone clinic registration in favor of doctor-owned clinic"
  ```

---

### Task 3: إضافة Endpoints إدارة العيادة في لوحة الطبيب (Doctor Clinic Management API)

**Files:**
- Modify: `backend/controllers/DoctorController.php`
- Modify: `backend/index.php`

**Interfaces:**
- Consumes: Token الطبيب المسجل (`AuthMiddleware::doctorOnly()`)
- Produces:
  - `GET /api/doctors/clinic`: جلب العيادة المملوكة للطبيب الحالي مع إعداداتها
  - `POST /api/doctors/clinic`: إنشاء عيادة جديدة وربطها بالطبيب كـ `owner_doctor_id` و `is_owner = 1`
  - `PUT /api/doctors/clinic`: تعديل بيانات العيادة للمالك
  - `PUT /api/doctors/clinic/settings`: تعديل أوقات الدوام والعطل وأسباب الكشف الخاصة بالعيادة

- [ ] **Step 1: إضافة دالة `getMyClinic()` في `DoctorController.php`**
  - فحص `owner_doctor_id` المرتبط بالطبيب أو `clinicsdoctors.is_owner = 1`.
  - جلب بيانات العيادة مع إعدادات الطبيب فيها (`doctorssettingapointements`, `doctorsoffhours`, `doctorsreasons`).

- [ ] **Step 2: إضافة دالة `createClinic()` في `DoctorController.php`**
  - التحقق من عدم وجود عيادة مملوكة مسبقاً لهذا الطبيب.
  - إدخال السجل في `clinics` مع `owner_doctor_id = $doctorId` و `status = 'PENDING'`.
  - إدخال السجل في `clinicsdoctors` مع `is_owner = 1` و `status = 'APPROVED'`.

- [ ] **Step 3: إضافة دالة `updateMyClinic()` في `DoctorController.php`**
  - التحقق من أن الطبيب هو مالك العيادة (`owner_doctor_id = $doctorId`).
  - تحديث بيانات الاسم، الهاتف، الفاكس، العنوان، الشعار، الخدمات، النبذة، والموقع.

- [ ] **Step 4: إضافة دالة `updateClinicSettings()` في `DoctorController.php`**
  - تحديث إعدادات الدوام (`doctorssettingapointements`) ومواعيد العطل (`doctorsoffhours`) الخاصة بالعيادة المحددة.

- [ ] **Step 5: ربط المسارات في `backend/index.php`**
  إضافة مسارات `/api/doctors/clinic` إلى موجه الطلبات.

- [ ] **Step 6: اختبار الـ Endpoints برمجياً**
  التأكد من أن إنشاء عيادة جديدة يعمل ويضع الحالة `PENDING` ويربط `is_owner = 1`.

- [ ] **Step 7: Commit**
  ```bash
  git add backend/controllers/DoctorController.php backend/index.php
  git commit -m "feat(backend): add clinic creation and management endpoints for doctors"
  ```

---

### Task 4: تحديث مسار اعتماد العيادات في لوحة الإدارة (Admin Clinic Approvals)

**Files:**
- Modify: `backend/controllers/AdminController.php`

**Interfaces:**
- Consumes: `POST /api/admin/clinics/{id}/approve`, `POST /api/admin/clinics/{id}/reject`
- Produces: عرض اسم الطبيب المالك للعيادة المعلقة، وتحديث حالة العيادة وسجل الارتباط عند الاعتماد.

- [ ] **Step 1: تحديث استعلام جلب العيادات المعلقة**
  دمج جدول `doctors` في استعلام العيادات لجلب اسم وبريد الطبيب المالك (`d.fullname as owner_name`, `d.email as owner_email`).

- [ ] **Step 2: تحديث دالة `approveClinic($id)`**
  - تحديث حالة العيادة إلى `APPROVED` في جدول `clinics`.
  - تحديث حالة علاقة الطبيب في `clinicsdoctors` إلى `APPROVED` إذا لزم الأمر.

- [ ] **Step 3: تحديث دالة `rejectClinic($id)`**
  - تحديث حالة العيادة إلى `REJECTED` وتسجيل سبب الرفض في `rejectedreason`.

- [ ] **Step 4: اختبار مسار الاعتماد**
  اعتماد عيادة معلقة والتأكد من تحولها إلى `APPROVED`.

- [ ] **Step 5: Commit**
  ```bash
  git add backend/controllers/AdminController.php
  git commit -m "feat(backend): enhance admin clinic approvals with owning doctor details"
  ```

---

### Task 5: تحديث واجهات التسجيل والقوائم في الواجهة الأمامية (Frontend Navbar & Registration)

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/api/client.js` (أو مسارات api)

**Interfaces:**
- Consumes: مسارات الواجهة الأمامية
- Produces: إزالة "تسجيل عيادة" من القوائم والبانرات، وتوجيه مسار `/register-clinic`.

- [ ] **Step 1: إزالة زر "تسجيل عيادة" من القائمة العلوية والواجهة الرئيسية في `App.jsx`**
  - حذف زر `/register-clinic` من شريط التنقل العلوي (Desktop & Mobile Drawer).
  - حذف زر "تسجيل عيادة" من قسم الـ Hero في الصفحة الرئيسية، والتركيز على "انضم كطبيب".

- [ ] **Step 2: تحديث صفحة `/register-clinic`**
  - إذا زار المستخدم الرابط `/register-clinic`، تظهر له بطاقة إرشادية أنيقة:
    "إدارة العيادات في منصة طبيبي أصبحت الآن مدمجة مع حساب الطبيب. يرجى تسجيل حسابك كطبيب لإنشاء عيادتك وإدارتها." مع زر مباشر ينقله لـ `/register-doctor`.

- [ ] **Step 3: فحص الواجهة في المتصفح**
  التأكد من خلو الموقع العام من أزرار تسجيل العيادات المستقلة، والتأكد من وضوح بطاقة التوجيه.

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/App.jsx
  git commit -m "refactor(frontend): streamline navigation to single doctor registration"
  ```

---

### Task 6: بناء واجهة "عيادتي" داخل لوحة تحكم الطبيب (Doctor My Clinic UI)

**Files:**
- Modify: `frontend/src/App.jsx` أو إنشاء مكون `frontend/src/components/DoctorClinicManager.jsx`
- Modify: `frontend/src/pages/Profile.jsx`

**Interfaces:**
- Consumes: `GET /api/doctors/clinic`, `POST /api/doctors/clinic`, `PUT /api/doctors/clinic`, `PUT /api/doctors/clinic/settings`
- Produces: واجهة مستخدم تفاعلية كاملة تمكن الطبيب من:
  1. رؤية حالة عيادته (غير منشأة، قيد المراجعة، معتمدة).
  2. إنشاء العيادة عبر استمارة متكاملة (الاسم، الهواتف، العنوان، GPS، الشعار، النبذة، والخدمات).
  3. تعديل بيانات العيادة وأوقات الدوام والعطل عند اعتمادها.

- [ ] **Step 1: بناء استمارة إنشاء العيادة (Create Clinic Form)**
  - كارت ترحيبي للطبيب عند عدم وجود عيادة: "أنشئ عيادتك الطبية".
  - حقول الإدخال مع التحقق (Validation) ودعم تحديد الموقع التلقائي عبر GPS.
  - إرسال البيانات عبر `POST /api/doctors/clinic`.

- [ ] **Step 2: بناء بطاقة حالة العيادة قيد المراجعة (Pending Clinic Card)**
  - عند نجاح الإنشاء، يظهر شريط تنبيه برتقالي هادئ: "عيادتك قيد مراجعة الإدارة وسيتم تفعيلها قريباً".
  - عرض معاينة لبيانات العيادة مع إمكانية التعديل.

- [ ] **Step 3: بناء لوحة إدارة العيادة المعتمدة (Approved Clinic Dashboard)**
  - تبويبات منظمة: "بيانات العيادة العامة"، "أوقات الدوام الأسبوعية"، "العطل والاستراحة"، "أسعار الفحوصات".
  - حفظ التغييرات بضغطة زر وتحديث الواجهة فورياً.

- [ ] **Step 4: اختبار الواجهة بالكامل عبر متصفح الاختبار**
  - إنشاء عيادة تجريبية بحساب طبيب والتأكد من ظهورها في الواجهة.

- [ ] **Step 5: Commit**
  ```bash
  git add frontend/src/
  git commit -m "feat(frontend): implement comprehensive doctor clinic management dashboard"
  ```

---

### Task 7: تحديث عرض العيادات المعلقة في لوحة تحكم الإدارة (Admin UI Enhancement)

**Files:**
- Modify: `frontend/src/pages/SuperAdminAccountManagement.jsx` أو `frontend/src/App.jsx` (لوحة الإدارة)

**Interfaces:**
- Consumes: بيانات العيادات المعلقة من الـ API
- Produces: إظهار اسم الطبيب المالك في بطاقة العيادة المعلقة لسهولة اتخاذ قرار الاعتماد.

- [ ] **Step 1: إضافة شارة الطبيب المنشئ في بطاقة العيادة**
  عرض: `الطبيب المالك: د. [الاسم] ([البريد الإلكتروني])`.

- [ ] **Step 2: اختبار إجراء الاعتماد والرفض من شاشة المشرف**
  الضغط على "موافقة" والتحقق من تحول حالة العيادة وحالة الطبيب المرتبط إلى `APPROVED`.

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/
  git commit -m "feat(admin): display creator doctor details on pending clinic approvals"
  ```

---

### Task 8: التحقق الشامل ونهاية المطاف (End-to-End Verification)

**Files:**
- اختبارات تكاملية على مستوى النظام بالكامل.

- [ ] **Step 1: دورة حياة كاملة للطبيب والعيادة**:
  1. زيارة الصفحة الرئيسية والتأكد من وضوح زر "انضم كطبيب".
  2. تسجيل حساب طبيب جديد والتأكد من دخوله في انتظار موافقة الإدارة.
  3. اعتماد الطبيب من لوحة المشرف.
  4. تسجيل دخول الطبيب والانتقال إلى قسم "عيادتي".
  5. ملء بيانات العيادة وإنشاؤها بنجاح (حالة `PENDING`).
  6. اعتماد العيادة من لوحة المشرف.
  7. التحقق من تحول حالة العيادة إلى `APPROVED` وظهورها في دليل العيادات ومحرك البحث.
  8. قيام الطبيب بتعديل أوقات العمل وحفظها بنجاح.
- [ ] **Step 2: تشغيل الاختبارات وبناء التطبيق والتحقق من عدم وجود أخطاء Linting**:
  التأكد من نظافة الكود وعدم وجود أي تحذيرات أو أخطاء تعطل السيرفر أو الفرونت إند.
- [ ] **Step 3: Final Commit**:
  ```bash
  git commit -m "feat: complete unified doctor-clinic account architecture"
  ```
