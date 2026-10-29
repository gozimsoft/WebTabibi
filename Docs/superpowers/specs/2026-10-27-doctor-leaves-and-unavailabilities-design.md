# 🩺 تصميم نظام إدارة الإجازات والطلعات الطارئة للأطباء ومعالجة المواعيد المتضاربة
*(Doctor Leaves, Emergency Unavailabilities & Existing Bookings Resolution System)*

- **التاريخ:** 2026-10-27
- **الحالة:** معتمد من المستخدم ومكتمل التصميم
- **المؤلف:** Antigravity AI Pair Programmer & Project Maintainer

---

## 1. نظرة عامة والهدف التشغيلي (Overview & Objectives)

في إدارة العيادات والمراكز الطبية الواقعية، يواجه الأطباء ومكاتب الاستقبال حالتين متكررتين:
1. **طلعة مؤقتة عن العمل لساعات محددة** (مثل: مغادرة الطبيب فجأة لمدة ساعتين أو إلغاء فترة المساء).
2. **عطلة أو مناسبة ليوم كامل أو عدة أيام** (مثل: مناسبة خاصة، عطلة سنوية، مؤتمر، أو طارئ صحي).

يهدف هذا النظام إلى توفير حل متكامل من طرفين:
- **المنع الاستباقي:** حجب هذه الأوقات أو الأيام فوراً من شاشات حجز المرضى ومنع أي حجز جديد عبر المنصة.
- **المعالجة الذكية للمواعيد القائمة:** في حال وجود مرضى مسجلين مسبقاً في ذلك التوقيت، يقوم النظام بكشفهم فوراً وتخيير السكرتيرة أو الطبيب لحظياً بين:
  - **الإلغاء مع إشعار اعتذار آلي.**
  - **الترحيل التلقائي الذكي** إلى أول يوم عمل متاح للطبيب مع إشعار المريض بالموعد الجديد.
  - **التنسيق اليدوي بالسكرتيرة** من خلال توفير جدول فوري يتضمن أرقام هواتفهم وزر اتصال مباشر.

---

## 2. مخطط قاعدة البيانات (Database Schema)

إنشاء جدول جديد مخصص باسم `doctor_unavailabilities` متوافق بنسبة 100% مع معمارية النظام (مفاتيح UUID v4، تشفير utf8mb4، وفهارس استعلام سريعة):

```sql
CREATE TABLE IF NOT EXISTS `doctor_unavailabilities` (
  `id` CHAR(36) NOT NULL,
  `doctor_id` CHAR(36) NOT NULL,
  `clinic_id` CHAR(36) DEFAULT NULL COMMENT 'إذا كان NULL يُطبق على كافة عيادات الطبيب',
  `clinicsdoctor_id` CHAR(36) DEFAULT NULL,
  `leave_type` ENUM('full_day', 'partial_hours', 'shift') NOT NULL DEFAULT 'full_day',
  `start_datetime` DATETIME NOT NULL COMMENT 'بداية فترة الغياب (تاريخ ووقت)',
  `end_datetime` DATETIME NOT NULL COMMENT 'نهاية فترة الغياب (تاريخ ووقت)',
  `shift_type` VARCHAR(20) DEFAULT NULL COMMENT 'morning أو evening أو full_day',
  `reason` VARCHAR(255) DEFAULT NULL COMMENT 'سبب الغياب أو المناسبة',
  `show_reason_to_patient` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'هل تظهر رسالة السبب للمرضى في شاشة الحجز',
  `created_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_doc_dates` (`doctor_id`, `start_datetime`, `end_datetime`),
  KEY `idx_cd_dates` (`clinicsdoctor_id`, `start_datetime`, `end_datetime`),
  CONSTRAINT `fk_unavail_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. واجهات الـ API ومنطق الخادم (Backend Architecture)

### 3.1 نقاط النهاية الجديدة (New Endpoints in `DoctorController` / `index.php`)

1. **`GET /doctor/unavailabilities`**
   - استرجاع قائمة الإجازات والطلعات الخاصة بالطبيب المسجل دخوله.
   - يدعم التصفية حسب `clinic_id` أو نطاق التواريخ.

2. **`POST /doctor/unavailabilities/check-conflicts`**
   - فحص استباقي خفيف وسريع.
   - يستقبل: `{ clinic_id, start_datetime, end_datetime, shift_type }`.
   - يعيد: `{ has_conflicts: boolean, count: number, appointments: [...] }` دون تعديل أي بيانات.

3. **`POST /doctor/unavailabilities`**
   - إنشاء وحفظ الغياب/الإجازة.
   - يستقبل:
     - `leave_type`, `clinic_id`, `start_datetime`, `end_datetime`, `shift_type`, `reason`, `show_reason_to_patient`.
     - `resolution_action`: `'none'` | `'cancel'` | `'reschedule'` | `'manual'`.
   - ينفذ المعالجة داخل Transaction:
     - إذا `cancel`: يُحدث المواعيد المتضاربة إلى `status = 2` (ملغى) ويُنشئ إشعارات آلية في `notifications`.
     - إذا `reschedule`: يحسب اليوم المتاح التالي للطبيب وينقل المواعيد إليه مع إشعار المرضى بالموعد الجديد.
     - إذا `manual`: يحفظ الإجازة ويُرجع قائمة بالمرضى المتأثرين وأرقام هواتفهم.

4. **`DELETE /doctor/unavailabilities/:id`**
   - حذف سجل الغياب وإعادة فتح المواعيد في تلك الفترة مجدداً.

### 3.2 تحديث مسارات الحجز الحالية (Booking Guards)

1. **`AppointmentController::getAvailableSlots()`**:
   - استعلام جدول `doctor_unavailabilities` للتاريخ المطلوب.
   - إذا كان اليوم عطلة كاملة: يعيد اليوم كمعطل (`day_unavailable: true`) مع سبب الغياب إن وُجد.
   - إذا كانت طلعة لساعات محددة: يستثني تلك الساعات من مصفوفة `slots`.
   - في نمط الطابور (`QUEUE_NUMBERS`): إذا شملت الطلعة كامل الفترة (صباحية أو مسائية)، يتم وضع حالة الفترة كـ `closed` / `unavailable`.
2. **`AppointmentController::create()`**:
   - فحص أمان صارم قبل الحفظ يمنع أي حجز متزامن يقع ضمن فترة غياب مسجلة.

---

## 4. واجهات وتجربة المستخدم (UI / UX Architecture)

### 4.1 تبويب "الإجازات والطلعات الطارئة" في `DoctorClinicManager.jsx`
- تبويب فرعي جديد باسم `"leaves"` يظهر في قائمة التبويبات بجانب فترات الاستراحة (`off_hours`).
- يضم:
  - زر ونموذج إضافة غياب جديد (تحديد النوع، التاريخ، الساعات، السبب، وإظهاره للمرضى).
  - جدول الإجازات القادمة والسابقة مع شارات توضيحية وزر حذف سريع.

### 4.2 النافذة الذكية لمعالجة التعارضات (`Conflict Resolution Modal`)
- تظهر تلقائياً عند النقر على "حفظ الغياب" إذا كشف الفحص وجود مواعيد محجوزة.
- تعرض بطاقات الخيارات الثلاثة:
  - **إلغاء المواعيد وإشعار المرضى تلقائياً.**
  - **ترحيل المواعيد آلياً إلى أقرب يوم متاح.**
  - **تنسيق يدوي من طرف السكرتيرة (مع قائمة أرقام الهواتف).**

### 4.3 زر الطوارئ السريع في `AppointmentManager.jsx`
- زر بارز في شريط أدوات الطابور اليومي: **"⚡ طلعة طارئة"** لتعليق الاستقبال لما تبقى من ساعات دوام اليوم بضغطة زر.

### 4.4 صفحة حجز المريض (`Book.jsx`)
- تلوين الأيام المعطلة في التقويم بعلامة توضيحية.
- إخفاء الساعات المستثناة من قائمة الاختيار.

---

## 5. خطة الفحص والتحقق (Verification Plan)

1. **فحص قاعدة البيانات:** إنشاء الجدول والتأكد من قيود المفاتيح الأجنبية والفهارس.
2. **فحص الـ API:**
   - اختبار `check-conflicts` على فترات بها مواعيد وفترات فارغة.
   - اختبار إضافة إجازة مع خيار `cancel` والتأكد من تحديث حالة المواعيد وإنشاء الإشعارات.
   - اختبار إضافة إجازة مع خيار `reschedule` والتأكد من نقل المواعيد.
   - اختبار صمام الأمان في `getAvailableSlots` و `create`.
3. **فحص الواجهات (Frontend UI):**
   - فتح وإضافة إجازة من `DoctorClinicManager`.
   - تجربة النافذة التفاعلية عند وجود تعارض.
   - التأكد من حجب الأوقات في صفحة الحجز `Book.jsx`.
