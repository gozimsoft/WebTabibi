# وثيقة التصميم المعماري: نظام حجز المواعيد المزدوج (بالتوقيت أو بالأرقام والقوائم) والتكامل مع Tabibi_Rect

**التاريخ**: 2026-10-25  
**الحالة**: معتمد للتنفيذ (Approved for Implementation)  
**المشروع**: WebTabibi (المنصة السحابية والويب) و Tabibi_Rect (برنامج تسيير العيادة)

---

## 1. الملخص التنفيذي والأهداف (Executive Summary)

### 1.1 السياق والمشكلة الميدانية
* يعتمد النظام حالياً في `WebTabibi` حصرياً على **حجز المواعيد بالتوقيت الدقيق** (Time-Slots)، حيث يحدد الطبيب مدة الكشف (مثلاً 20 دقيقة) وتُعرض للمريض ساعات محددة (09:00، 09:20، 09:40...).
* **الواقع الميداني في العيادات الطبية (خاصة في الجزائر)**:
  - نسبة كبرى من الأطباء (طب أطفال، طب عام، عيون، قلب، أنف وأذن وحنجرة...) يرفضون أو يعجزون عن التقيد بجدول الدقائق الصارم؛ نظراً لتفاوت مدة الفحص الشديد بين مريض وآخر، ووجود حالات مستعجلة، وثقافة الحضور الصباحي المبكر.
  - يعمل هؤلاء الأطباء بنظام **قائمة الحضور اليومية المرقمة (Queue/Tokens)** بسقف استيعاب يومي (مثلاً 40 مريضاً)، حيث يحصل كل مريض على رقم تسلسلي (تذكرة دور)، وعند امتلاء القائمة يتوقف الحجز إلا للحالات الطارئة.
  - إجبار الأطباء على نظام التوقيت فقط يُعد عائقاً رئيسياً أمام تبني المنصة.

### 1.2 الأهداف المعتمدة للتصميم
1. **نظام مزدوج واختياري بالكامل (Dual-Mode Booking)**:
   - يختار الطبيب من الإعدادات نمط العمل المفضل لديه:
     - `نمط التوقيت الدقيق (Time-Slots)`: النظام القديم كما هو دون أي تغيير.
     - `نمط الأرقام والتذاكر (Queue/Token Numbers)`: النظام الجديد المطور.
2. **أسبقية حجز موحدة ومشتركة (First-Come, First-Served)**:
   - قائمة موحدة يشترك فيها المرضى المحجوزون عبر المنصة والمرضى المسجلون حضورياً في مكتب الاستقبال بالعيادة (`Tabibi_Rect`)؛ كل حجز يأخذ الرقم التسلسلي الموالي فوراً.
3. **دعم القائمة الواحدة أو القائمتين (Single or Double Shift)**:
   - إمكانية تحديد قائمة واحدة لليوم (مثلاً 40 مريضاً)، أو قائمتين منفصلتين (صباحية بسعة 25 مريضاً، ومسائية بسعة 15 مريضاً).
4. **توقيت تقديري ذكي (Estimated Consultation Time)**:
   - يحصل المريض مع رقم تذكرته على وقت تقريبي محسوب آلياً بناءً على وقت بدء الفترة ومعدل الفحص التقديري.
5. **إمكانية تجاوز السقف للطوارئ (Emergency Overbooking)**:
   - إمكانية إضافة حالات طارئة تتجاوز السقف بقرار الطبيب/السكرتيرة.
6. **التوافق العكسي التام (100% Backward Compatibility)**:
   - الحفاظ على عمل الأنظمة السابقة وحسابات الأطباء التي تفضل نظام التوقيت دون أي خلل.
7. **التكامل المباشر مع برنامج تسيير العيادة (`Tabibi_Rect`)**:
   - إدراج بنية الجداول مباشرة في الكود المنشئ لقاعدة البيانات عند التثبيت الأولي عبر نافذة إعدادات الاتصال.

---

## 2. بنية البيانات وقاعدة البيانات (Database Schema & DDL)

### 2.1 التعديلات على جدول إعدادات الدوام (`doctorssettingapointements`)
إضافة الحقول الخاصة بنظام الأرقام مع قيم افتراضية تضمن بقاء الأطباء الحاليين على نظام التوقيت:

```sql
ALTER TABLE `doctorssettingapointements`
  ADD COLUMN `booking_mode` TINYINT NOT NULL DEFAULT 0 COMMENT '0: Time-Slots, 1: Queue-Numbers',
  ADD COLUMN `shift_mode` TINYINT NOT NULL DEFAULT 1 COMMENT '1: Single Shift, 2: Double Shift',
  ADD COLUMN `morning_start` TIME DEFAULT '08:30:00' COMMENT 'Morning shift start time',
  ADD COLUMN `morning_end` TIME DEFAULT '12:30:00' COMMENT 'Morning shift end time',
  ADD COLUMN `morning_capacity` INT NOT NULL DEFAULT 25 COMMENT 'Max patients for morning shift',
  ADD COLUMN `evening_start` TIME DEFAULT '14:00:00' COMMENT 'Evening shift start time',
  ADD COLUMN `evening_end` TIME DEFAULT '17:30:00' COMMENT 'Evening shift end time',
  ADD COLUMN `evening_capacity` INT NOT NULL DEFAULT 15 COMMENT 'Max patients for evening shift',
  ADD COLUMN `allow_overbooking` TINYINT NOT NULL DEFAULT 1 COMMENT '1: allow emergency addition above capacity';
```

### 2.2 التعديلات على جدول المواعيد (`apointements`)
إضافة حقول الترقيم وإدارة الطابور:

```sql
ALTER TABLE `apointements`
  ADD COLUMN `token_number` INT DEFAULT NULL COMMENT 'Sequential ticket number per shift/day',
  ADD COLUMN `shift_type` VARCHAR(10) DEFAULT 'morning' COMMENT 'morning, evening, full_day',
  ADD COLUMN `estimated_time` TIME DEFAULT NULL COMMENT 'Estimated consultation time',
  ADD COLUMN `is_emergency` TINYINT NOT NULL DEFAULT 0 COMMENT '1 if added above capacity for emergency',
  ADD COLUMN `queue_status` VARCHAR(20) NOT NULL DEFAULT 'waiting' COMMENT 'waiting, in_consultation, completed, absent',
  ADD INDEX `idx_queue_lookup` (`clinicsdoctor_id`, `apointementdate`, `shift_type`, `token_number`);
```

### 2.3 كود التثبيت والإنشاء الأولي (First-Run Installer SQL)
لإدراجه مباشرة في كود تهيئة قاعدة البيانات عند أول تثبيت في نافذة إعدادات الاتصال في `Tabibi_Rect` والـ Backend:

```sql
-- 1. جدول إعدادات دوام ومواعيد الأطباء
CREATE TABLE IF NOT EXISTS `doctorssettingapointements` (
  `id` CHAR(36) NOT NULL,
  `doctor_id` CHAR(36) NOT NULL,
  `clinic_id` CHAR(36) NOT NULL,
  `booking_mode` TINYINT NOT NULL DEFAULT 0 COMMENT '0: Time-Slots, 1: Queue-Numbers',
  `shift_mode` TINYINT NOT NULL DEFAULT 1 COMMENT '1: Single Shift, 2: Double Shift',
  `timescale` INT NOT NULL DEFAULT 15 COMMENT 'Estimated duration in mins',
  `morning_start` TIME DEFAULT '08:30:00',
  `morning_end` TIME DEFAULT '12:30:00',
  `morning_capacity` INT NOT NULL DEFAULT 25,
  `evening_start` TIME DEFAULT '14:00:00',
  `evening_end` TIME DEFAULT '17:30:00',
  `evening_capacity` INT NOT NULL DEFAULT 15,
  `allow_overbooking` TINYINT NOT NULL DEFAULT 1,
  `daytimestart` DATETIME DEFAULT '1899-12-30 08:30:00',
  `daytimeend` DATETIME DEFAULT '1899-12-30 17:30:00',
  `workingdays` VARCHAR(7) NOT NULL DEFAULT '1111110',
  `weekbeginday` INT NOT NULL DEFAULT 0,
  `countdays` INT NOT NULL DEFAULT 30,
  `isregistered` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_doc_clinic_settings` (`doctor_id`, `clinic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول المواعيد والتذاكر
CREATE TABLE IF NOT EXISTS `apointements` (
  `id` CHAR(36) NOT NULL,
  `clinicsdoctor_id` CHAR(36) NOT NULL,
  `patient_id` CHAR(36) DEFAULT NULL,
  `patientname` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(25) DEFAULT NULL,
  `apointementdate` DATETIME NOT NULL,
  `token_number` INT DEFAULT NULL COMMENT 'Sequential queue number',
  `shift_type` VARCHAR(10) DEFAULT 'morning' COMMENT 'morning, evening, full_day',
  `estimated_time` TIME DEFAULT NULL COMMENT 'Estimated consultation time',
  `is_emergency` TINYINT NOT NULL DEFAULT 0 COMMENT '1 if emergency',
  `queue_status` VARCHAR(20) NOT NULL DEFAULT 'waiting' COMMENT 'waiting, in_consultation, completed, absent',
  `reason_id` CHAR(36) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `status` INT NOT NULL DEFAULT 0 COMMENT '0: active, 1: cancelled, 2: completed',
  `consent_health` TINYINT NOT NULL DEFAULT 1,
  `consent_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedat` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_queue_lookup` (`clinicsdoctor_id`, `apointementdate`, `shift_type`, `token_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. منطق العمليات وخوارزميات الحجز (Backend Logic & APIs)

### 3.1 استعلام المواعيد والفترات المتاحة (`GET /appointments/available-slots`)
* **المدخلات**: `clinics_doctor_id`, `date` (YYYY-MM-DD).
* **المعالجة**:
  - فحص `booking_mode` للطبيب:
    - إذا كان `0` (Time-Slots): توليد شبكة الساعات العادية عبر `buildSlots` وحذف المحجوز والمستثنى.
    - إذا كان `1` (Queue-Numbers):
      - فحص يوم العمل (`workingdays`) واستثناء العطل (`doctorsoffhours`).
      - قراءة الفترات المحددة (`shift_mode` = 1 أو 2).
      - استعلام قاعدة البيانات لحساب:
        ```sql
        SELECT 
          COALESCE(MAX(token_number), 0) AS max_token,
          COUNT(*) AS active_count
        FROM apointements
        WHERE clinicsdoctor_id = :cdId
          AND DATE(apointementdate) = :date
          AND shift_type = :shift
          AND status != 1
        ```
      - حساب المقاعد المتبقية: `remaining = capacity - active_count`.
      - حساب الرقم القادم: `next_token = max_token + 1`.
      - حساب الوقت التقديري للرقم القادم:
        $$\text{Estimated Time} = \text{Shift Start} + (\text{next\_token} - 1) \times \text{timescale}$$
* **مخرجات الـ JSON**:
  ```json
  {
    "status": "success",
    "data": {
      "booking_mode": "queue",
      "date": "2026-10-26",
      "shifts": [
        {
          "shift_type": "morning",
          "label": "الفترة الصباحية",
          "start_time": "08:30",
          "end_time": "12:30",
          "capacity": 25,
          "booked_count": 14,
          "remaining": 11,
          "is_full": false,
          "next_token": 15,
          "estimated_time_for_next": "10:45"
        }
      ]
    }
  }
  ```

### 3.2 تأكيد الحجز وحماية أسبقية الأرقام (`POST /appointments`)
* **حماية التزامن (Concurrency Protection)**:
  - بدء معاملة ذرية `BEGIN TRANSACTION`.
  - قفل السجلات لليوم والفترة باستخدام `FOR UPDATE`:
    ```sql
    SELECT COALESCE(MAX(token_number), 0) AS max_token, COUNT(*) AS active_count
    FROM apointements
    WHERE clinicsdoctor_id = :cdId
      AND DATE(apointementdate) = :date
      AND shift_type = :shift
      AND status != 1
    FOR UPDATE;
    ```
  - فحص السقف: إذا كان `active_count >= capacity` و `is_emergency != 1`، يتم إرجاع خطأ `409 Conflict`:
    *"عذراً، اكتملت قائمة هذه الفترة بالكامل (25/25). يرجى اختيار فترة أخرى أو موعد في يوم آخر."*
  - إسناد `token_number = max_token + 1`.
  - حساب `estimated_time` وحفظ التذكرة.
  - تنفيذ `COMMIT`.

### 3.3 سياسة إلغاء التذاكر
- عند إلغاء مريض لموعده (`status = 1`): **أرقام باقي المرضى لا تتغير مطلقا** حفاظاً على ثبات التذاكر الصادرة.
- يتخطى الطبيب/السكرتيرة في الطابور الرقم الملغى تلقائياً.

### 3.4 إدارة الطابور الحي (`PUT /api/appointments/:id/queue-status`)
- تحديث حالة المريض في الطابور إلى: `waiting`, `in_consultation`, `completed`, `absent`.

### 3.5 نقطة نهاية شاشة الانتظار السريعة (`GET /api/appointments/live-queue-status`)
- تعيد الرقم الحالي تحت الفحص، والرقم التالي، وعدد المنتظرين:
  ```json
  {
    "current_serving_token": 12,
    "current_patient_name": "محمد ع.",
    "next_token": 13,
    "waiting_count": 11,
    "shift_type": "morning"
  }
  ```

---

## 4. تجربة المستخدم والواجهات (Frontend UX Architecture)

### 4.1 إعدادات الطبيب (`DoctorAppointmentSettings.jsx`)
- علامات تبويب للتبديل السريع بين:
  - ⏱️ **نظام المواعيد بالتوقيت الدقيق**.
  - 🔢 **نظام القوائم والتذاكر بالأرقام**:
    - اختيار نوع الدوام: (قائمة واحدة طوال اليوم / قائمتان صباحية ومسائية).
    - حقول التوقيت والسعة لكل فترة.
    - مدة الكشف التقديرية (بالدقائق) لحساب الوقت التقريبي.
    - تفعيل/تعطيل تجاوز السقف للطوارئ.

### 4.2 لوحة إدارة الطابور الحي للطبيب والعيادة (`AppointmentManager.jsx`)
- **شريط علوي تفاعلي**:
  - عرض المريض الحالي: "المريض الحالي: رقم #12".
  - زر مميز: "مناداة المريض التالي (#13)".
  - عدادات إحصائية (إجمالي، فُحصوا، منتظرون، غائبون).
- **جدول التذاكر التفاعلي**:
  - ترتيب تسلسلي (1، 2، 3...).
  - إظهار: رقم التذكرة، الوقت التقديري، الاسم، الهاتف، مصدر الحجز (ويب / مكتب استطبال)، وحالة الطابور.
  - أزرار سريعة لكل سطر: [دخول العيادة]، [إنهاء الكشف]، [تسجيل غياب].
- **إجراءات سريعة للسكرتيرة**:
  - زر **"تسجيل مريض بالاستقبال (Walk-in Desk)"**: نافذة منبثقة سريعة (اسم + هاتف) لحجز الرقم الموالي فوراً.
  - زر **"إضافة حالة طارئة (Emergency Overbooking)"**: لإضافة مريض استثنائي حتى مع اكتمال القائمة.

### 4.3 تجربة المريض في الحجز ومتابعة دوره (`Book.jsx` و `Appointments.jsx`)
- في `Book.jsx`:
  - بطاقات أنيقة للفترات المتاحة تبين: السعة المتبقية، رقم التذكرة القادم، ووقت الكشف التقديري.
  - رسالة واضحة عند اكتمال القائمة توجه لاختيار فترة أو يوم آخر.
  - تذكرة رقمية جاهزة بعد التأكيد تحتوي على رقم التذكرة ووقت الحضور وإرشادات التواجد المسبق.
- في `Appointments.jsx`:
  - في يوم الموعد: مؤشر حي يوضح: "الطبيب يفحص الآن رقم #X"، "المتبقي أمامك: Y مرضى".

---

## 5. التكامل مع برنامج تسيير العيادة (`Tabibi_Rect`)

1. **التهيئة والتثبيت الأولي**:
   - إدراج أوامر DDL الواردة في القسم (2.3) داخل كود نافذة إعدادات الاتصال في `Tabibi_Rect` ليتم بناء الجداول بالحقول الجديدة تلقائياً عند أول تشغيل.
2. **المزامنة اللحظية للأرقام**:
   - اعتماد السكرتيرة على الـ APIs الموحدة؛ بحيث يؤدي تسجيل أي مريض في العيادة إلى تقليل السعة المتاحة أونلاين فورياً ومنع أي تضارب في الأرقام.
3. **شاشة تلفاز قاعة الانتظار (TV Queue Display)**:
   - دعم فتح نافذة عرض مخصصة في `Tabibi_Rect` تُعرض على شاشة قاعة الانتظار وتتحدث تلقائياً مع رنة تنبيه خفيفة عند مناداة المريض التالي.

---

## 6. خطة التحقق والاختبار (Verification & Testing Plan)

1. **اختبار التوافق العكسي (Backward Compatibility)**:
   - التأكد من أن حسابات الأطباء التي تعمل بنظام `booking_mode = 0` تحتفظ بكامل مسار حجز الساعات القديم دون أي تغيير.
2. **اختبار خوارزمية الأرقام والتوقيت التقريبي**:
   - اختبار توليد الأرقام التسلسلية (1، 2، 3...).
   - اختبار حساب التوقيت التقريبي (مثلاً: 08:30 + (N-1)*15 min).
3. **اختبار حماية التزامن وسقف القائمة (Capacity Enforcement)**:
   - تجربة حجز متزامن لمريضين والتأكد من إسناد أرقام فريدة وغير مكررة.
   - التأكد من منع الحجز عند وصول العدد إلى السقف المحدد (مثلاً 25/25).
4. **اختبار إضافة الحالات الطارئة (Emergency Overbooking)**:
   - التأكد من قدرة الطبيب/السكرتيرة على إضافة مريض بحالة طارئة عند اكتمال القائمة.
5. **اختبار إدارة الطابور الحي**:
   - اختبار تحديث الحالات (مناداة التالي، دخول، إنهاء، غياب) وانعكاسها الفوري على الـ API وشاشة المريض.
