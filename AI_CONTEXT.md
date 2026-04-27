# AI_CONTEXT.md — Tabibi Project Reference
> **هذا الملف هو المرجع الرئيسي للمشروع. يجب قراءته قبل أي تعديل.**
> Last updated: 2026-04-26

---

## 1. نظرة عامة على المشروع

**Tabibi (طبيبي)** — منصة لإدارة العيادات الطبية في الجزائر. تتكون من:
- **Backend**: REST API بـ PHP (بدون Framework) يعمل على XAMPP
- **Frontend**: React 18 + Vite (SPA بـ Hash Routing)
- **Mobile**: Capacitor/Android (نفس الـ Frontend)
- **Desktop**: تطبيق Delphi يتزامن مع السيرفر عبر `/sync/*`
- **Production URL**: `https://tabibi.dz`
- **Frontend Base Path**: `/web/` (vite base config)

---

## 2. بنية المشروع

```
WebTabibi/
├── backend/
│   ├── index.php              ← الـ Router الرئيسي (كل الـ Routes هنا)
│   ├── config/database.php    ← إعدادات DB + SMTP + URLs
│   ├── core/
│   │   ├── Database.php       ← Singleton PDO connection
│   │   └── Response.php       ← JSON response helper
│   ├── middleware/
│   │   └── AuthMiddleware.php ← Bearer Token auth + RBAC
│   ├── helpers/
│   │   └── UUIDHelper.php     ← UUID generator
│   └── controllers/
│       ├── AuthController.php
│       ├── PatientController.php
│       ├── DoctorController.php
│       ├── ClinicController.php
│       ├── AppointmentController.php
│       ├── SyncController.php
│       ├── AdminController.php
│       ├── RelationController.php
│       ├── TicketController.php
│       ├── ChatController.php
│       ├── RatingController.php
│       ├── RegistrationController.php
│       └── VerificationController.php
└── frontend/
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx            ← كل الـ Routing + Layout هنا (ملف ضخم 246KB)
        ├── i18n.js            ← إعداد i18next (ar/fr/en)
        ├── api/client.js      ← HTTP client موحد
        ├── context/AuthContext.jsx
        ├── hooks/useRoute.js  ← Hash-based router
        ├── components/
        │   ├── Navbar.jsx
        │   ├── OTPModal.jsx
        │   ├── SharedUI.jsx
        │   └── LanguageSwitcher.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Search.jsx
        │   ├── DoctorDetail.jsx
        │   ├── Book.jsx
        │   ├── Appointments.jsx
        │   ├── Profile.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Chat.jsx
        │   └── Contact.jsx
        └── locales/
            ├── ar.json  ← اللغة الافتراضية (RTL)
            ├── fr.json
            └── en.json
```

---

## 3. إعدادات البيئة

| المتغير | القيمة |
|---|---|
| DB Host | `178.32.109.176` |
| DB Name | `uyyuppcc_DBTabibi` |
| DB User | `uyyuppcc_admin` |
| DB Charset | `utf8mb4` |
| Token Expiry | 30 يوم (`86400 * 30`) |
| SMTP | `smtp.gmail.com:587` (stellarsoftpro@gmail.com) |
| Frontend Dev Port | `82` |
| Vite Proxy `/api` | → `https://tabibi.dz` |

---

## 4. قاعدة البيانات — جميع الجداول

### 4.1 جداول المستخدمين الأساسية

#### `users`
| الحقل | النوع | ملاحظة |
|---|---|---|
| id | uuid | PK |
| username | varchar | |
| password | varchar | مشفر بـ base64 (للتوافق مع Delphi) |
| usertype | int | 0=مريض, 1=طبيب, 2=عيادة, 3=أدمن |

#### `sessions`
| الحقل | النوع | ملاحظة |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| token | varchar | Bearer token |
| usertype | int | |
| expires_at | datetime | |

#### `patients`
| الحقل | النوع | ملاحظة |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| fullname | varchar | |
| phone | varchar | |
| email | varchar | |
| birthdate | date | |
| gender | varchar | |
| emailvalidation | int | 0/1 |
| phonevalidation | int | 0/1 |

#### `doctors`
| الحقل | النوع | ملاحظة |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| fullname | varchar | |
| phone | varchar | |
| email | varchar | |
| specialtie_id | uuid | FK → specialties.id |
| status | enum | PENDING/APPROVED/REJECTED |
| experience | int | سنوات الخبرة |
| photoprofile | longtext | base64 encoded |
| approvedat | datetime | |

#### `clinics`
| الحقل | النوع | ملاحظة |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| clinicname | varchar | |
| phone | varchar | |
| email | varchar | |
| address | varchar | |
| status | enum | PENDING/APPROVED/REJECTED |
| emergency | tinyint | 0/1 |
| hospitalization | tinyint | 0/1 |
| logo | longtext | base64 encoded |
| approvedat | datetime | |

---

### 4.2 جداول المواعيد

#### `apointements` ⚠️ (اسم الجدول مكتوب هكذا — لا تغييره)
| الحقل | النوع | ملاحظة |
|---|---|---|
| id | uuid | PK |
| apointementdate | datetime | |
| patientname | varchar | |
| clinicsdoctor_id  | uuid | FK → clinicsdoctors.id | 
| reason_id | uuid |   → reasons.id | 
|apointementcolor| int |   
|phone| varchar | 
| notes | text | | 
| status | int | 0 = قيد الانتظار - 1 = ملغاة - 2 = تم التشخيص عند الطبيب
| UpdatedAt | datetime | 
|patient_id | uuid |  FK → patients.id |
---

### 4.3 جداول العلاقات

#### `clinicsdoctors` — العلاقة بين الأطباء والعيادات
| الحقل | النوع | ملاحظة |
|---|---|---|
| id | uuid | PK |
| clinic_id | uuid | FK → clinics.id |
| doctor_id | uuid | FK → doctors.id |
| specialtie_id | uuid | FK → specialties.id |
| status | varchar | pending/accepted/rejected |
| requestedby | varchar | DOCTOR/CLINIC |
---

### 4.4 جداول بيانات مساعدة

#### `specialties`
| الحقل | النوع |
|---|---|
| id | uuid |
| namear | varchar |
| namefr | varchar |
| nameen | varchar |

#### `wilayas`
| الحقل | النوع |
|---|---|
| id | int |
| namear | varchar |
| namefr | varchar |

#### `baladiyas`
| الحقل | النوع |
|---|---|
| id | int |
| namear | varchar |
| namefr | varchar |
| wilaya_id | int |

#### `reasons` — أسباب الزيارة الطبية
| الحقل | النوع |
|---|---|
| id | uuid |
| namear | varchar |
| namefr | varchar |
| doctor_id | uuid |

---

### 4.5 جداول التسجيل (بانتظار موافقة الأدمن)

#### `clinicregistrations`
| الحقل | النوع |
|---|---|
| id | uuid |
| clinicname | varchar |
| email | varchar |
| phone | varchar |
| address | text |
| notes | text |
| password | varchar |
| status | PENDING/APPROVED/REJECTED |
| rejectedreason | text |
| approvedat | datetime |
| createdat | datetime |
| clinic_id | uuid |
| user_id | uuid |

#### `doctorregistrations`
| الحقل | النوع |
|---|---|
| id | uuid |
| fullname | varchar |
| speciality | varchar |
| email | varchar |
| phone | varchar |
| password | varchar |
| status | PENDING/APPROVED/REJECTED |
| rejectedreason | text |
| approvedat | datetime |
| createdat | datetime |
| doctor_id | uuid |
| user_id | uuid |

---

### 4.6 جداول الدعم والتواصل

#### `tickets`
| الحقل | النوع |
|---|---|
| id | uuid |
| patient_id | uuid |
| doctor_id | uuid (nullable) |
| clinic_id | uuid (nullable) |
| subject | varchar |
| status | OPEN/PENDING/CLOSED |
| updated_at | datetime |

#### `ticketmessages`
| الحقل | النوع |
|---|---|
| id | uuid |
| ticket_id | uuid |
| sender_type | varchar (patient/doctor/clinic) |
| sender_id | uuid |
| message | text |
| is_read | tinyint |
| created_at | datetime |

#### `messagethreads` — الدردشة المباشرة
| الحقل | النوع |
|---|---|
| id | uuid |
| patient_id | uuid |
| doctor_id | uuid |
| objectmessage | varchar |
| isclose | tinyint |
| datecreate | datetime |

#### `messages`
| الحقل | النوع |
|---|---|
| id | uuid |
| messagethread_id | uuid |
| contentmessage | text |
| datesend | datetime |
| isdoctor | tinyint (0=patient, 1=doctor) |

---

### 4.7 جداول أخرى

#### `doctorsratings`
| الحقل | النوع |
|---|---|
| id | uuid |
| patient_id | uuid |
| doctor_id | uuid |
| rating | int (1-5) |
| comment | text |
| hidepatient | tinyint |

#### `verifications` — OTP للتحقق
| الحقل | النوع |
|---|---|
| id | uuid |
| user_id | uuid |
| type | email/phone |
| target | varchar |
| code | varchar (6 أرقام) |
| expires_at | datetime |
| verified | tinyint |
| created_at | datetime |

---

## 5. الـ API Routes الكاملة

**Base URL**: `https://tabibi.dz/api` (prod) | `/api` (dev proxy)

### Auth (بدون توثيق)
| Method | Route | Controller::Method |
|---|---|---|
| POST | `/auth/register` | AuthController::register |
| POST | `/auth/login` | AuthController::login |
| POST | `/auth/logout` | AuthController::logout |
| GET | `/auth/me` | AuthController::me |

### Verification (مريض فقط)
| Method | Route | Controller::Method |
|---|---|---|
| POST | `/verify/send` | VerificationController::send |
| POST | `/verify/confirm` | VerificationController::confirm |
| GET | `/verify/status` | VerificationController::status |

### Patient (مريض فقط)
| Method | Route | Controller::Method |
|---|---|---|
| GET | `/patients/profile` | PatientController::getProfile |
| PUT | `/patients/profile` | PatientController::updateProfile |
| GET | `/patients/appointments` | PatientController::getAppointments |

### Doctor
| Method | Route | Controller::Method |
|---|---|---|
| GET | `/doctors/profile` | DoctorController::getProfile |
| PUT | `/doctors/profile` | DoctorController::updateProfile |
| POST | `/doctors/photo` | DoctorController::uploadPhoto |
| POST | `/doctors/upload` | DoctorController::uploadDoctor (Delphi sync) |

### Clinics
| Method | Route | Controller::Method |
|---|---|---|
| GET | `/clinics` | ClinicController::search |
| GET | `/clinics/profile` | ClinicController::getProfile |
| PUT | `/clinics/profile` | ClinicController::updateProfile |
| POST | `/clinics/profile` | ClinicController::uploadProfile |
| POST | `/clinics/logo` | ClinicController::uploadSelfLogo |
| GET | `/clinics/:id` | ClinicController::getClinic |
| GET | `/clinics/:id/photo` | ClinicController::getPhoto |
| POST | `/clinics/:id/photo` | ClinicController::uploadPhoto |
| GET | `/clinics/:cId/doctors/:dId` | ClinicController::getDoctorAtClinic |

### Lookups (عامة)
| Method | Route | Controller::Method |
|---|---|---|
| GET | `/specialties` | ClinicController::getSpecialties |
| GET | `/wilayas` | ClinicController::getWilayas |
| GET | `/baladiyas` | ClinicController::getBaladiyas |
| GET | `/reasons` | ClinicController::getReasons |

### Appointments
| Method | Route | Controller::Method |
|---|---|---|
| GET | `/appointments/available-slots` | AppointmentController::getAvailableSlots |
| POST | `/appointments` | AppointmentController::book |
| GET | `/appointments/:id` | AppointmentController::getOne |
| DELETE | `/appointments/:id` | AppointmentController::cancel |

### Chat
| Method | Route | Controller::Method |
|---|---|---|
| GET | `/chat/threads` | ChatController::getThreads |
| POST | `/chat/threads` | ChatController::createThread |
| GET | `/chat/threads/:id` | ChatController::getMessages |
| POST | `/chat/threads/:id/messages` | ChatController::sendMessage |

### Ratings
| Method | Route | Controller::Method |
|---|---|---|
| POST | `/ratings` | RatingController::addRating |
| GET | `/ratings/doctor/:id` | RatingController::getDoctorRatings |

### Sync (Delphi ↔ Server)
| Method | Route | Controller::Method |
|---|---|---|
| POST | `/sync/upload` | SyncController::upload |
| GET | `/sync/download` | SyncController::download |
| POST | `/sync/delete` | SyncController::delete |
| GET | `/sync/status` | SyncController::status |
| GET | `/sync/logs` | SyncController::logs |
| GET | `/sync/reasons` | SyncController::reasons |

### Public Registration
| Method | Route | Controller::Method |
|---|---|---|
| POST | `/register/clinic` | RegistrationController::registerClinic |
| POST | `/register/doctor` | RegistrationController::registerDoctor |
| GET | `/register/status` | RegistrationController::checkStatus |

### Admin (usertype=3 فقط)
| Method | Route | Controller::Method |
|---|---|---|
| GET | `/admin/stats` | AdminController::stats |
| GET | `/admin/clinics` | AdminController::listClinics |
| GET | `/admin/doctors` | AdminController::listDoctors |
| POST | `/admin/clinics/:id/approve` | AdminController::approveClinic |
| POST | `/admin/clinics/:id/reject` | AdminController::rejectClinic |
| POST | `/admin/doctors/:id/approve` | AdminController::approveDoctor |
| POST | `/admin/doctors/:id/reject` | AdminController::rejectDoctor |

### Relations (طبيب ↔ عيادة)
| Method | Route | Controller::Method |
|---|---|---|
| POST | `/relations/request` | RelationController::sendRequest |
| GET | `/relations/requests` | RelationController::getRequests |
| GET | `/relations/check/:targetId` | RelationController::checkRelation |
| POST | `/relations/requests/:id/respond` | RelationController::respondToRequest |

### Tickets (دعم)
| Method | Route | Controller::Method |
|---|---|---|
| POST | `/tickets` | TicketController::create |
| GET | `/tickets` | TicketController::list |
| GET | `/tickets/:id` | TicketController::get |
| POST | `/tickets/:id/reply` | TicketController::reply |
| POST | `/tickets/:id/close` | TicketController::close |

---

## 6. نظام التوثيق (AuthMiddleware)

```
Bearer Token → جدول sessions → user_id + usertype
```

| usertype | النوع | صلاحيات الـ Middleware |
|---|---|---|
| 0 | مريض (Patient) | `patientOnly()` |
| 1 | طبيب (Doctor) | `authenticate()` |
| 2 | عيادة (Clinic) | `authenticate()` |
| 3 | أدمن (Admin) | `adminOnly()` |

**قاعدة مهمة**: `authenticate()` يُرجع `['user_id', 'usertype', 'doctor_id'/'clinic_id'/'patient_id']` حسب النوع.

---

## 7. Frontend — بنية React

### نظام التوجيه
- **Hash-based routing** عبر `useRoute.js` (لا يوجد React Router)
- التنقل: `window.location.hash = '#/path'`
- كل الـ routing موجود في `App.jsx`

### الصفحات وشاشاتها
| الصفحة | Hash | الوصف |
|---|---|---|
| Home | `#/` | الصفحة الرئيسية |
| Search | `#/search` | البحث عن عيادات/أطباء |
| DoctorDetail | `#/doctor/:id` | تفاصيل الطبيب |
| Book | `#/book` | حجز موعد |
| Appointments | `#/appointments` | مواعيدي |
| Profile | `#/profile` | ملف المريض |
| Login | `#/login` | تسجيل دخول |
| Register | `#/register` | تسجيل مريض |
| Chat | `#/chat` | المحادثات |
| Contact | `#/contact` | تذاكر الدعم |

### AuthContext
```js
const { user, profile, loading, login, register, logout, setProfile } = useAuth();
// user.usertype: 0/1/2/3
// token مخزن في: localStorage.getItem('tabibi_token')
```

### API Client (`src/api/client.js`)
```js
BASE_URL = import.meta.env.VITE_API_URL || '/api'
// Token تلقائياً من localStorage في كل request
// يرمي Error إذا success === false
```

### اللغات
- **الافتراضية**: عربي (RTL)
- **المدعومة**: ar, fr, en
- تغيير `document.dir` تلقائياً عند تغيير اللغة

---

## 8. قواعد عامة يجب مراعاتها دائماً

### ⚠️ قواعد قاعدة البيانات
1. **كل أسماء الجداول والحقول بـ lowercase** (باستثناء ما هو موثق بشكل مختلف أعلاه مثل `apointements`)
2. `apointements` — اسم الجدول مكتوب هكذا (خطأ إملائي مقصود للتوافق، لا تغييره)
3. الصور (logo, photoprofile) مخزنة كـ **LONGTEXT base64** في DB
4. كلمات المرور مشفرة بـ **base64_encode** فقط (للتوافق مع Delphi)
5. كل المفاتيح الأساسية **UUID** (ليس auto-increment)

### ⚠️ قواعد الـ Backend
1. لا يوجد Framework — كل شيء عبر `index.php` بـ `if` conditions
2. `spl_autoload_register` يحمل الكلاسات تلقائياً من المجلدات المعروفة
3. كل response يعيد `{ success, data, message }` عبر `Response` class
4. `Database::getInstance()` هو PDO singleton — استخدمه دائماً

### ⚠️ قواعد الـ Frontend
1. **لا يوجد React Router** — التنقل عبر hash فقط
2. كل شيء في `App.jsx` (ملف ضخم) — لا تفصله إلا بطلب صريح
3. عند إضافة route جديد: أضفه في `backend/index.php` **و** `src/api/client.js`

### ⚠️ نظام المزامنة (Delphi)
1. تطبيق Delphi يرسل `doctor_id` مع Bearer token خاص به
2. `/sync/upload` — يستقبل مواعيد من Delphi ويحدث DB
3. `/sync/download` — يرسل المواعيد الجديدة لـ Delphi
4. حقل `synced` في `apointements` يتتبع حالة المزامنة

---

## 9. سير العمل الرئيسية

### تسجيل طبيب/عيادة جديدة
```
POST /register/clinic → clinicregistrations (status=PENDING)
→ أدمن يوافق: POST /admin/clinics/:id/approve
→ يُنشئ: users + clinics + يحدث clinicregistrations
```

### حجز موعد
```
GET /appointments/available-slots?doctor_id=&clinic_id=&date=
→ يحسب الفترات المتاحة بناءً على working hours
POST /appointments { doctor_id, clinic_id, date, reason, ... }
→ يُرسل email تأكيد للمريض
```

### طلب انضمام طبيب لعيادة
```
POST /relations/request { target_id: clinic_id }  (من الطبيب)
→ clinicsdoctors (status=pending, requestedby=DOCTOR)
POST /relations/requests/:id/respond { action: 'accept' }  (من العيادة)
→ clinicsdoctors (status=accepted)
```

---

## 10. ملفات لا تُعدَّل بدون فهم كامل

| الملف | السبب |
|---|---|
| `backend/index.php` | يحتوي كل الـ routes — خطأ واحد يوقف الـ API كله |
| `backend/controllers/SyncController.php` | منطق معقد للمزامنة مع Delphi |
| `backend/config/database.php` | بيانات الاتصال الحقيقية |
| `frontend/src/App.jsx` | ملف ضخم (246KB) يحتوي كل الـ UI |
| `backend/middleware/AuthMiddleware.php` | الأمان — أي خطأ يكشف البيانات |
