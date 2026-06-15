# Changelog

سجل تغييرات مشروع طبيبي.

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
