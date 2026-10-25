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

## 📅 4. الـ Endpoints الخاصة بالمواعيد وقائمة الدور (Appointments & Queue)

### 4.1. جلب الأوقات أو فترات الطابور المتاحة للحجز (Available Slots / Shifts)
- **الوصف:** إرجاع الخيارات المتاحة للحجز حسب نظام عمل الطبيب (مواعيد محددة بالساعة أو قائمة دور بتذاكر رقمية).
- **المسار (URL):** `/appointments/available-slots`
- **الطريقة (Method):** `GET`
- **الترويسات (Headers):** `Authorization: Bearer <Your_Token>` (أو بدون مصادقة للبحث العام).
- **المعلمات (Query Parameters):**
  - `clinics_doctor_id` (إلزامي): الـ UUID الخاص بارتباط الطبيب بالعيادة.
  - `date` (إلزامي): التاريخ بصيغة `YYYY-MM-DD`.
- **الاستجابة الناجحة في نمط المواعيد بالساعة (`booking_mode: 0`):**
  ```json
  {
    "success": true,
    "data": ["08:00", "08:30", "09:00", "10:30"],
    "message": "الأوقات المتاحة"
  }
  ```
- **الاستجابة الناجحة في نمط قائمة الدور والأرقام (`booking_mode: 1`):**
  ```json
  {
    "success": true,
    "data": {
      "booking_mode": "queue",
      "shift_mode": 2,
      "shifts": [
        {
          "type": "morning",
          "label": "الفترة الصباحية",
          "start_time": "08:00",
          "end_time": "13:00",
          "capacity": 25,
          "booked_count": 14,
          "remaining": 11,
          "next_token": 15,
          "estimated_time_for_next": "10:45",
          "is_full": false
        },
        {
          "type": "evening",
          "label": "الفترة المسائية",
          "start_time": "14:00",
          "end_time": "18:00",
          "capacity": 15,
          "booked_count": 0,
          "remaining": 15,
          "next_token": 1,
          "estimated_time_for_next": "14:00",
          "is_full": false
        }
      ]
    },
    "message": "فترات الدور المتاحة للحجز"
  }
  ```

### 4.2. حجز موعد جديد (Book Appointment)
- **الوصف:** إنشاء موعد جديد للمريض في فترة زمنية محددة أو أخذ تذكرة دور تتابعية.
- **المسار (URL):** `/appointments`
- **الطريقة (Method):** `POST`
- **الترويسات (Headers):** 
  - `Content-Type: application/json`
  - `Authorization: Bearer <Your_Token>`
- **الجسم لنظام المواعيد بالساعة:**
  ```json
  {
    "clinics_doctor_id": "ea49ae02-ee22-4e7f-97b8-d2a8289e93aa",
    "doctors_reason_id": "1b2a977a-33e2-4c9e-94bc-4462956a04f5",
    "date": "2026-05-01",
    "time": "09:00",
    "note": "أعاني من آلام في الظهر"
  }
  ```
- **الجسم لنظام قائمة الدور والأرقام:**
  ```json
  {
    "clinics_doctor_id": "ea49ae02-ee22-4e7f-97b8-d2a8289e93aa",
    "doctors_reason_id": "1b2a977a-33e2-4c9e-94bc-4462956a04f5",
    "date": "2026-05-01",
    "shift_type": "morning",
    "note": "كشف عام"
  }
  ```
- **استجابة حجز تذكرة الدور الناجحة:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-appointment-1",
      "token_number": 15,
      "shift_type": "morning",
      "estimated_time": "10:45:00",
      "queue_status": "waiting",
      "message": "تم تأكيد حجزك بنجاح! رقم دورك هو 15 والوقت التقريبي للكشف 10:45"
    }
  }
  ```

### 4.3. الاستعلام المباشر عن حالة الطابور وشاشة الانتظار (Live Queue Status)
- **الوصف:** جلب الحالة اللحظية لطابور العيادة (من هو المريض المفحوص حالياً، من هو المريض التالي، وعدد المنتظرين).
- **المسار (URL):** `/appointments/live-queue-status`
- **الطريقة (Method):** `GET`
- **المعلمات (Query Parameters):**
  - `clinic_id` (أو `clinics_doctor_id`): معرف العيادة أو ارتباط الطبيب.
  - `date`: تاريخ اليوم `YYYY-MM-DD`.
  - `shift_type`: `'morning'` أو `'evening'` (اختياري).
- **الاستجابة:**
  ```json
  {
    "success": true,
    "data": {
      "current_serving": { "token_number": 12, "patientname": "محمد علي", "queue_status": "in_consultation" },
      "next_waiting": { "token_number": 13, "patientname": "فاطمة الزهراء", "queue_status": "waiting" },
      "waiting_count": 8,
      "completed_count": 11,
      "absent_count": 1,
      "total_in_queue": 20
    }
  }
  ```

### 4.4. تحديث حالة المريض في الطابور (Update Queue Status)
- **الوصف:** التحكم في سير الطابور من قبل السكرتيرة أو الطبيب (إدخال المريض لقاعة الكشف، إنهاء الاستشارة، تسجيل غياب).
- **المسار (URL):** `/appointments/:id/queue-status`
- **الطريقة (Method):** `PUT`
- **الجسم (Request Body):**
  ```json
  {
    "queue_status": "in_consultation"
  }
  ```
  *(الحالات المدعومة: `waiting`, `in_consultation`, `completed`, `absent`, `cancelled`)*

### 4.5. إعدادات فترات ومواعيد الطبيب (Doctor Appointment Settings)
- **المسارات:**
  - `GET /doctors/appointment-settings`: جلب قائمة إعدادات فترات العمل للطبيب.
  - `POST /doctors/appointment-settings`: إنشاء إعداد يوم جديد.
  - `PUT /doctors/appointment-settings/:id`: تعديل إعداد اليوم (تغيير النمط بين مواعيد وطابور، تعديل السعة الصباحية/المسائية، تفعيل الطوارئ).
- **الحقول المدعومة:** `day`, `timescale`, `booking_mode`, `shift_mode`, `morning_start`, `morning_end`, `morning_capacity`, `evening_start`, `evening_end`, `evening_capacity`, `allow_overbooking`.

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

