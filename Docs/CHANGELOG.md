# Changelog

سجل تغييرات مشروع طبيبي.

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
