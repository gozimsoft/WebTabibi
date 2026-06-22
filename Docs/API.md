# 🔌 توثيق واجهة برمجة التطبيقات (API Reference)

يعتمد مشروع "طبيبي" على بنية RESTful API مخصصة مبرمجة بلغة PHP. جميع الطلبات يجب أن توجه إلى المسار الأساسي (Base URL).

**المسار الأساسي لبيئة الإنتاج:** `https://tabibi.dz/api`
**المسار الأساسي لبيئة التطوير:** `http://localhost:8000/api`

> ⚠️ **ملاحظة عامة على جميع الاستجابات:**
> كل استجابات الـ API ترجع بتنسيق JSON موحد يحتوي على الحقول الثلاثة التالية:
> ```json
> {
>   "success": true,        // (boolean) هل نجحت العملية أم فشلت
>   "data": {},             // (object/array/null) البيانات المطلوبة
>   "message": "رسالة"      // (string) رسالة توضيحية للمستخدم أو رسالة الخطأ
> }
> ```

---

## 🔐 1. الـ Endpoints الخاصة بالمصادقة (Auth)

### 1.1. تسجيل الدخول (Login)
- **الوصف:** تسجيل الدخول لأي نوع من المستخدمين (مريض، طبيب، عيادة).
- **المسار (URL):** `/auth/login`
- **الطريقة (Method):** `POST`
- **الترويسات (Headers):** `Content-Type: application/json`
- **الجسم (Request Body):**
  ```json
  {
    "username": "Kaioran",
    "password": "myPassword123" 
  }
  ```
  *(ملاحظة: الـ Frontend يرسل كلمة المرور الأصلية، والـ Backend يقوم بتشفيرها لـ Base64 لمقارنتها بالـ DB).*
- **الاستجابة الناجحة (Success Response):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI...",
      "user": {
        "id": "123e4567-e89b-12d3-...",
        "usertype": 0
      }
    },
    "message": "تم تسجيل الدخول بنجاح"
  }
  ```

### 1.2. تسجيل الدخول باستخدام قوقل (Google Login)
- **الوصف:** تسجيل الدخول أو إنشاء حساب جديد مباشرة عن طريق حساب قوقل (خاص بالمرضى).
- **المسار (URL):** `/auth/google`
- **الطريقة (Method):** `POST`
- **الترويسات (Headers):** `Content-Type: application/json`
- **الجسم (Request Body):**
  ```json
  {
    "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI..." 
  }
  ```
  *(ملاحظة: يتم استخراج `credential` بواسطة Google Identity Services من الواجهة الأمامية).*
- **الاستجابة الناجحة (Success Response):**
  نفس استجابة `تسجيل الدخول (Login)`.

### 1.3. تسجيل الخروج (Logout)
- **الوصف:** تدمير جلسة المستخدم وحذف الـ Token من قاعدة البيانات.
- **المسار (URL):** `/auth/logout`
- **الطريقة (Method):** `POST`
- **الترويسات (Headers):** `Authorization: Bearer <Your_Token>`
- **الجسم (Request Body):** فارغ.

---

## 🏥 2. الـ Endpoints الخاصة بالعيادات والأطباء

### 2.1. البحث عن العيادات (Search Clinics)
- **الوصف:** البحث عن العيادات وتصفيتها.
- **المسار (URL):** `/clinics`
- **الطريقة (Method):** `GET`
- **المعلمات (Query Parameters):**
  - `q` (اختياري): نص للبحث باسم العيادة.
  - `specialty` (اختياري): UUID الخاص بالتخصص لفلترة الأطباء بالعيادات.
  - `wilaya_id` (اختياري): رقم الولاية.
- **الترويسات (Headers):** لا تتطلب مصادقة (Public).
- **الاستجابة الناجحة (Success Response):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-clinic-1",
        "clinicname": "عيادة الشفاء",
        "doctors": [ ... ]
      }
    ],
    "message": ""
  }
  ```

---

## 👤 3. الـ Endpoints الخاصة بالمرضى (Patients)

### 3.1. تغيير بيانات الدخول (Update Credentials)
- **الوصف:** يسمح للمريض بتغيير اسم المستخدم أو كلمة المرور الخاصة به.
- **المسار (URL):** `/patients/credentials`
- **الطريقة (Method):** `PUT`
- **الترويسات (Headers):** `Authorization: Bearer <Your_Token>` (يجب أن يكون مريض).
- **الجسم (Request Body):**
  ```json
  {
    "new_username": "newuser456",
    "new_password": "myNewPassword789"
  }
  ```
  *(ملاحظة: يجب تقديم `new_username` أو `new_password` على الأقل).*
- **الاستجابة الناجحة (Success Response):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "تم تحديث بيانات الدخول بنجاح."
  }
  ```

---

## 📅 4. الـ Endpoints الخاصة بالمواعيد (Appointments)

### 3.1. جلب الأوقات المتاحة للحجز (Available Slots)
- **الوصف:** حساب وإرجاع فترات الحجز المتاحة لطبيب معين في عيادة محددة خلال يوم.
- **المسار (URL):** `/appointments/available-slots`
- **الطريقة (Method):** `GET`
- **الترويسات (Headers):** `Authorization: Bearer <Your_Token>` (يجب أن يكون مريض).
- **المعلمات (Query Parameters):**
  - `clinics_doctor_id` (إلزامي): الـ UUID الخاص بارتباط الطبيب بالعيادة.
  - `date` (إلزامي): التاريخ بصيغة `YYYY-MM-DD`.
- **الاستجابة الناجحة (Success Response):**
  ```json
  {
    "success": true,
    "data": ["08:00", "08:30", "09:00", "10:30"],
    "message": "الأوقات المتاحة"
  }
  ```

### 3.2. حجز موعد جديد (Book Appointment)
- **الوصف:** إنشاء موعد جديد للمريض في فترة زمنية معينة.
- **المسار (URL):** `/appointments`
- **الطريقة (Method):** `POST`
- **الترويسات (Headers):** 
  - `Content-Type: application/json`
  - `Authorization: Bearer <Your_Token>`
- **الجسم (Request Body):**
  ```json
  {
    "clinics_doctor_id": "ea49ae02-ee22-4e7f-97b8-d2a8289e93aa",
    "doctors_reason_id": "1b2a977a-33e2-4c9e-94bc-4462956a04f5",
    "date": "2026-05-01",
    "time": "09:00",
    "note": "أعاني من آلام في الظهر"
  }
  ```
- **حالات الخطأ المحتملة (Error Handling):**
  - إذا كان الموعد محجوزاً مسبقاً (Conflict): يرجع `success: false` مع كود `409 Conflict`.
  - إذا كان الطبيب في عطلة (OffHours): يرجع `success: false` برسالة توضيحية.

---

## 🔄 4. الـ Endpoints للمزامنة مع (Delphi Desktop Sync)

هذه الـ Endpoints مخصصة لاستخدام النظام المكتبي فقط.

### 4.1. رفع بيانات المزامنة (Upload Sync)
- **المسار (URL):** `/sync/upload`
- **الطريقة (Method):** `POST`
- **الترويسات:** التوكن الخاص ببرنامج Delphi.
- **الجسم:** يحتوي على المواعيد الجديدة المُسجلة في العيادة، حالات الأطباء، وتقارير التشخيص، ليتم رفعها للخادم السحابي.

### 4.2. تنزيل بيانات المزامنة (Download Sync)
- **المسار (URL):** `/sync/download`
- **الطريقة (Method):** `GET`
- **الاستجابة:** قائمة بالمواعيد التي حجزها المرضى من الموقع الإلكتروني (تطبيق React) ليقوم نظام Delphi بحفظها محلياً وعرضها لسكرتير العيادة.

---

## 🔔 5. الـ Endpoints الخاصة بالتنبيهات (Notifications)

### 5.1. جلب التنبيهات (List Notifications)
- **الوصف:** جلب جميع التنبيهات الخاصة بالمستخدم الحالي مرتبة من الأحدث إلى الأقدم.
- **المسار (URL):** `/notifications`
- **الطريقة (Method):** `GET`
- **الترويسات (Headers):** `Authorization: Bearer <Your_Token>`
- **الاستجابة الناجحة (Success Response):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-notif-1",
        "user_id": "uuid-user-1",
        "title": "حجز موعد جديد",
        "message": "تم حجز موعد جديد من قبل المريض: أحمد بتاريخ 2026-06-15 10:00",
        "type": "appointment",
        "is_read": 0,
        "created_at": "2026-06-12 18:00:00"
      }
    ],
    "message": ""
  }
  ```

### 5.2. تحديد تنبيه كمقروء (Mark Notification as Read)
- **الوصف:** تحديث حالة تنبيه محدد ليكون مقروءاً.
- **المسار (URL):** `/notifications/:id/read`
- **الطريقة (Method):** `PUT`
- **الترويسات (Headers):** `Authorization: Bearer <Your_Token>`
- **الاستجابة الناجحة (Success Response):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "تم تحديد التنبيه كمقروء"
  }
  ```

### 5.3. تحديد كل التنبيهات كمقروءة (Mark All as Read)
- **الوصف:** تحديد جميع التنبيهات الخاصة بالمستخدم الحالي كمقروءة دفعة واحدة.
- **المسار (URL):** `/notifications/read-all`
- **الطريقة (Method):** `PUT`
- **الترويسات (Headers):** `Authorization: Bearer <Your_Token>`
- **الاستجابة الناجحة (Success Response):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "تم تحديد جميع التنبيهات كمقروءة"
  }
  ```

### 5.4. حذف تنبيه (Delete Notification)
- **الوصف:** حذف تنبيه معين بشكل نهائي.
- **المسار (URL):** `/notifications/:id`
- **الطريقة (Method):** `DELETE`
- **الترويسات (Headers):** `Authorization: Bearer <Your_Token>`
- **الاستجابة الناجحة (Success Response):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "تم حذف التنبيه بنجاح"
  }
  ```

---

## 🌍 6. الـ Endpoints الخاصة بإحصائيات الزيارات (Visits)

### 6.1. تسجيل زيارة جديدة (Log Visit)
- **الوصف:** تسجيل زيارة مستخدم للموقع مع تحديد الدولة والولاية لغرض عرضها في لوحة تحكم الإدارة.
- **المسار (URL):** `/visits`
- **الطريقة (Method):** `POST`
- **الترويسات (Headers):** لا تتطلب مصادقة (Public).
- **الجسم (Request Body):**
  ```json
  {
    "country": "Algeria",
    "wilaya": "Algiers"
  }
  ```
- **الاستجابة الناجحة (Success Response):**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Visit logged"
  }
  ```

