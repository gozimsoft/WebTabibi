# 🏥 طبيبي — Tabibi | نظام حجز المواعيد الطبية

<div align="center">

![Tabibi Banner](https://via.placeholder.com/800x200/0891b2/ffffff?text=طبيبي+—+Tabibi)

**منصة حجز المواعيد الطبية في الجزائر**  
PHP Backend API + React Frontend

</div>

---

## 📋 تحليل قاعدة البيانات

### الجداول الرئيسية والعلاقات

```
Users (المستخدمون)
├── UserType = 0 → Patients (مرضى)
└── UserType = 1 → Doctors  (أطباء)

Clinics (عيادات)
└──< ClinicsDoctors (ربط عيادة-طبيب-تخصص)
     ├── Doctor_ID → Doctors
     ├── Clinic_ID → Clinics
     └── specialtie_id → Specialties

Doctors (أطباء)
├──< DoctorsReasons         (أسباب زيارة الطبيب في كل عيادة)
├──< DoctorsSettingApointements (جدول العمل + فترات العمل)
├──< DoctorsOffHours        (أوقات الغياب)
└──< DoctorsRatings         (تقييمات المرضى)

Apointements (المواعيد)
├── ClinicsDoctor_id → ClinicsDoctors
├── DoctorsReason_id → DoctorsReasons
└── Patient_id → Patients

MessageThreads (محادثات)
├── Patient_id → Patients
├── Doctor_id → Doctors
└──< Messages (رسائل)

Baladiyas + Wilayas (جغرافيا الجزائر)
```

### نظام تحديد الأوقات المتاحة

```
DoctorsSettingApointements:
  WorkingDays = "1111011"   ← كل رقم يمثل يوم (0=أحد → 6=سبت)
  TimeScale   = 10          ← مدة كل موعد بالدقائق
  DaytimeStart = 08:00      ← بداية الدوام
  DaytimeEnd   = 16:00      ← نهاية الدوام

DoctorsOffHours:
  Day       = 1             ← يوم الاثنين
  TimeBegin = 12:00         ← بداية الغياب
  TimeEnd   = 13:00         ← نهاية الغياب
```

---

## 🗂️ هيكل المشروع

```
tabibi/
│
├── backend/                    PHP REST API
│   ├── config/
│   │   └── database.php        ← إعدادات DB + SMTP + متغيرات التطبيق
│   ├── core/
│   │   ├── Database.php        ← PDO Singleton
│   │   └── Response.php        ← JSON Response Helper
│   ├── middleware/
│   │   └── AuthMiddleware.php  ← Token Authentication (sessions table)
│   ├── helpers/
│   │   ├── UUIDHelper.php      ← توليد UUID v4
│   │   └── EmailHelper.php     ← إشعارات البريد (HTML)
│   ├── controllers/
│   │   ├── AuthController.php       ← تسجيل / دخول / خروج / معلوماتي
│   │   ├── PatientController.php    ← ملف المريض + مواعيده
│   │   ├── ClinicController.php     ← بحث عيادات + تفاصيل طبيب
│   │   ├── AppointmentController.php ← حجز + أوقات متاحة + إلغاء
│   │   ├── ChatController.php       ← دردشة مريض-طبيب
│   │   └── RatingController.php     ← تقييم الأطباء
│   ├── .htaccess               ← Apache routing + CORS + Security headers
│   └── index.php               ← Router رئيسي (match-based)
│
├── frontend/                   React SPA (Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             ← التطبيق الكامل (9 صفحات)
│       ├── api/client.js       ← طبقة API
│       └── context/AuthContext.jsx ← حالة المصادقة
│
├── postman_collection.json     ← اختبار جميع الـ Endpoints
└── README.md
```

---

## ⚙️ التثبيت والتشغيل

### المتطلبات
- PHP 8.0+
- MySQL 5.7+ / MariaDB 10.4+
- Apache 2.4+ (mod_rewrite) أو Nginx
- Node.js 18+ + npm

---

### الخطوة 1: إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات واستيراد البيانات
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS uyyuppcc_DBTabibi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p uyyuppcc_DBTabibi < uyyuppcc_DBTabibi_1_.sql
```

---

### الخطوة 2: إعداد Backend

```bash
cd tabibi/backend

# 1. تعديل إعدادات الاتصال
nano config/database.php
```

غيّر:
```php
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('MAIL_USER', 'your@email.com');
define('MAIL_PASS', 'your_app_password');
```

```bash
# 2. تشغيل PHP built-in server (للتطوير)
php -S localhost:8000

# أو مع Apache: ضع المشروع في /var/www/html/tabibi/backend
```

**اختبار سريع:**
```bash
curl http://localhost:8000/api/health
# {"success":true,"data":{"status":"ok","api":"Tabibi v1.0"}}
```

---

### الخطوة 3: إعداد Frontend

```bash
cd tabibi/frontend

# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npm run dev
# ← يفتح على http://localhost:5173

# بناء للإنتاج
npm run build
# ← الملفات في dist/
```

---

### الخطوة 4: اختبار API

```bash
# استيراد postman_collection.json في Postman
# أو استخدام cURL:

# تسجيل دخول (حساب موجود في DB)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Kaioran","password":"FJHajf552:"}'

# البحث عن أطباء أسنان
TOKEN="your_token_here"
curl "http://localhost:8000/api/clinics?specialty=da1953a6-5b58-11f0-9c01-525400088b55" \
  -H "Authorization: Bearer $TOKEN"

# عرض الأوقات المتاحة
curl "http://localhost:8000/api/appointments/available-slots?clinics_doctor_id=ea49ae02-ee22-4e7f-97b8-d2a8289e93aa&date=2026-05-01" \
  -H "Authorization: Bearer $TOKEN"

# حجز موعد
curl -X POST http://localhost:8000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "clinics_doctor_id": "ea49ae02-ee22-4e7f-97b8-d2a8289e93aa",
    "doctors_reason_id": "1b2a977a-33e2-4c9e-94bc-4462956a04f5",
    "date": "2026-05-01",
    "time": "09:00",
    "note": "Première consultation"
  }'
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | الوصف |
|--------|----------|------|-------|
| POST | `/api/auth/register` | ❌ | تسجيل مريض جديد |
| POST | `/api/auth/login` | ❌ | تسجيل الدخول |
| POST | `/api/auth/logout` | ✅ | تسجيل الخروج |
| GET  | `/api/auth/me` | ✅ | بياناتي |
| GET  | `/api/specialties` | ❌ | قائمة التخصصات |
| GET  | `/api/wilayas` | ❌ | الولايات |
| GET  | `/api/clinics?q=&specialty=` | ❌ | بحث |
| GET  | `/api/clinics/:id` | ❌ | تفاصيل عيادة |
| GET  | `/api/clinics/:cId/doctors/:dId` | ❌ | طبيب في عيادة |
| GET  | `/api/appointments/available-slots` | ✅ | أوقات متاحة |
| POST | `/api/appointments` | ✅ | حجز موعد |
| GET  | `/api/patients/appointments` | ✅ | مواعيدي |
| DELETE | `/api/appointments/:id` | ✅ | إلغاء موعد |
| GET  | `/api/patients/profile` | ✅ | ملفي |
| PUT  | `/api/patients/profile` | ✅ | تعديل ملفي |
| GET  | `/api/chat/threads` | ✅ | محادثاتي |
| POST | `/api/chat/threads` | ✅ | محادثة جديدة |
| GET  | `/api/chat/threads/:id` | ✅ | رسائل محادثة |
| POST | `/api/chat/threads/:id/messages` | ✅ | إرسال رسالة |
| POST | `/api/ratings` | ✅ | تقييم طبيب |
| GET  | `/api/ratings/doctor/:id` | ❌ | تقييمات طبيب |

---

## 🔐 الأمان

| الميزة | التفاصيل |
|--------|---------|
| **Authentication** | Token مخزن في جدول `sessions` في DB |
| **SQL Injection** | PDO Prepared Statements في كل الاستعلامات |
| **Password** | Base64 (متوافق مع DB الحالية) — يُنصح بـ `password_hash()` في الإنتاج |
| **CORS** | Headers محددة في `.htaccess` و `index.php` |
| **Input Validation** | فحص الحقول المطلوبة + تنظيف البيانات |

> ⚠️ **للإنتاج**: غيّر `Access-Control-Allow-Origin: *` إلى domain محدد، و استخدم HTTPS.

---

## 🎨 الصفحات (Frontend)

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| الرئيسية | `/` | Hero + بحث + تخصصات + كيف يعمل |
| تسجيل الدخول | `/login` | مع حساب تجريبي |
| تسجيل حساب | `/register` | نموذج كامل |
| البحث | `/search?q=&specialty=` | بحث + فلترة |
| تفاصيل طبيب | `/clinic/:cId/doctor/:dId` | ملف الطبيب + تقييمات |
| حجز موعد | `/book/:cId/:dId` | معالج 3 خطوات |
| مواعيدي | `/appointments` | قادمة + ماضية + إلغاء |
| ملفي الشخصي | `/profile` | تعديل كامل |
| الرسائل | `/chat` | دردشة مريض-طبيب |

---

## 📦 حساب تجريبي

```
👤 مريض:  Kaioran  |  FJHajf552:
👨‍⚕️ طبيب: admin    |  ZGFobGs= (base64)
```

---

*Tabibi © 2026 — جميع الحقوق محفوظة*
