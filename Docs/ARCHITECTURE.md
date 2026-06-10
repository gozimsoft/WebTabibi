# 🏛️ الهيكل البرمجي (Architecture)

## 📊 تحليل الهيكل البرمجي للمشروع
يعتمد مشروع **طبيبي** على بنية مفصولة بالكامل بين الواجهة الأمامية والواجهة الخلفية (Client-Server Architecture). 

### 1. الواجهة الخلفية (Backend - PHP)
لا يستخدم المشروع إطار عمل جاهز (Framework مثل Laravel)، بل يعتمد على نظام مخصص (Custom Architecture) يشبه نمط الـ MVC. هذا الخيار يعطي أداءً سريعاً وسهولة في تتبع الكود:
- **Front Controller Pattern**: جميع الطلبات تمر عبر نقطة دخول واحدة وهي ملف `index.php` الذي يلعب دور الموجّه (Router) الأساسي.
- **Controllers**: تحتوي على منطق الأعمال (Business Logic) وتتواصل مع قاعدة البيانات عبر طبقة الوصول للبيانات.
- **Core / Helpers**: فئات مساعدة لمعالجة المهام المتكررة (مثل كلاس `Response` لإرجاع JSON الموحد، وكلاس `UUIDHelper` لتوليد المعرفات الفريدة، وكلاس `Database` الذي يمثل Singleton للاتصال الدائم بقاعدة البيانات).
- **Middleware**: طبقة للتحقق من المصادقة والصلاحيات (مثل `AuthMiddleware`)، وهي تُنفذ قبل السماح للطلب بالوصول للمتحكم (Controller).

### 2. الواجهة الأمامية (Frontend - React)
- تطبيق صفحة واحدة (Single Page Application).
- لا يعتمد على `react-router-dom` كالمعتاد، بل يستخدم نظام توجيه مبني يدوياً يعتمد على الـ Hash (مثال: `/#/login`).
- يُدار التوجيه العام والواجهة الهيكلية عبر ملف مركزي (`App.jsx`).
- إدارة الحالة تعتمد على React Context (مثل `AuthContext` الذي يوفر معلومات المستخدم الحالي، التوكن، وحالة التحميل في كل أنحاء التطبيق).
- التواصل مع الخادم يتم عبر كلاس/ملف مخصص للـ API (`src/api/client.js`) يضمن إرفاق التوكن مع جميع الطلبات.

## 📁 تقسيم المجلدات والملفات (Directory Structure)

```text
WebTabibi/
├── backend/                    # الخادم وواجهة برمجة التطبيقات
│   ├── config/                 # إعدادات النظام (الاتصال بقاعدة البيانات، والبريد)
│   ├── controllers/            # متحكمات الـ API (كل كلاس يمثل جزء/ميزة من النظام)
│   ├── core/                   # النواة (مثل Database.php و Response.php)
│   ├── helpers/                # دوال مساعدة (مثل EmailHelper.php)
│   ├── middleware/             # طبقة الحماية والمصادقة (AuthMiddleware.php)
│   └── index.php               # نقطة الدخول والموجه الرئيسي (Main Router)
└── frontend/                   # واجهة المستخدم (React)
    ├── src/
    │   ├── api/                # إعدادات الاتصال بالخادم (HTTP Client)
    │   ├── components/         # المكونات المشتركة القابلة لإعادة الاستخدام (UI)
    │   ├── context/            # مزودات الحالة (مثل AuthContext)
    │   ├── hooks/              # خطافات مخصصة (مثل useRoute لتنظيم التنقل)
    │   ├── locales/            # ملفات الترجمة (ar, fr, en)
    │   ├── pages/              # صفحات التطبيق المستقلة (Home, Login, Profile)
    │   ├── App.jsx             # الملف الرئيسي المجمع للصفحات وللتوجيه
    │   └── main.jsx            # نقطة إقلاع تطبيق React
    └── vite.config.js          # إعدادات بناء وتشغيل التطبيق (يدعم الـ Proxy)
```

## 🔄 العلاقات والاعتماديات (Dependencies & Flow)

### 1. دورة حياة الطلب (Request Lifecycle) في الخادم
- **الخطوة 1**: يُرسل تطبيق الـ Frontend طلب HTTP إلى `https://tabibi.dz/api/appointments` ومرفق معه ترويسة المصادقة `Authorization: Bearer <token>`.
- **الخطوة 2**: يستقبل خادم Apache الطلب ويوجهه عبر ملف `.htaccess` إلى الملف `backend/index.php`.
- **الخطوة 3**: يتحقق الموجه (Router) من الـ URI ويحدد المتحكم المناسب (مثلاً `AppointmentController::book`).
- **الخطوة 4**: بما أن المسار محمي، يتم استدعاء `AuthMiddleware::authenticate()` أو `patientOnly()` لفحص صحة الـ Token في جدول `sessions`، وإذا كان صالحاً، يكمل التنفيذ.
- **الخطوة 5**: يقوم المتحكم بتنفيذ المنطق (التحقق من البيانات المدخلة، حجز الموعد باستخدام `Database::getInstance()`).
- **الخطوة 6**: يعيد الخادم الرد باستخدام `Response::json()` ليُطبع كـ JSON.

### 2. التكامل مع تطبيق العيادة (Delphi Synchronization Flow)
- يعمل نظام العيادة المحلي أوفلاين كلياً باستخدام قاعدة بيانات محلية.
- عند توفر الإنترنت، يتصل النظام بالـ API المخصص `/api/sync/upload` أو `download`.
- **التدفق**: يرسل تطبيق Delphi المواعيد الجديدة المُسجلة لديه إلى الخادم ليتم إضافتها، وفي نفس الوقت يستعلم عن المواعيد الجديدة التي قام المرضى بحجزها أونلاين عبر الـ React Frontend لكي تتزامن في التطبيق المكتبي، مما يمنع التعارض (Conflicts).

## 💡 أمثلة برمجية مع تعليقات بالعربية لتوضيح المعمارية

**مثال: طريقة عمل الـ Router في `index.php`**
```php
// جلب الـ URI وتنظيفه
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// توجيه الطلب إلى متحكم المواعيد
if (preg_match('/^\/api\/appointments$/', $uri)) {
    if ($method === 'GET') {
        // فحص الصلاحيات (مريض فقط)
        $user = AuthMiddleware::patientOnly();
        AppointmentController::getAllForPatient($user['patient_id']);
    } elseif ($method === 'POST') {
        // فحص الصلاحيات
        $user = AuthMiddleware::patientOnly();
        AppointmentController::book($user['patient_id']);
    }
}
```

**مثال: طريقة استدعاء قاعدة البيانات في Controller**
```php
class AppointmentController {
    public static function book($patientId) {
        // استدعاء اتصال قاعدة البيانات (Singleton)
        $db = Database::getInstance()->getConnection();
        
        // جلب البيانات من الطلب (Request Body)
        $data = json_decode(file_get_contents('php://input'), true);
        
        // التحضير والإدخال بأمان (Prepared Statement) لمنع SQL Injection
        $stmt = $db->prepare("INSERT INTO apointements (id, patient_id, ...) VALUES (?, ?, ...)");
        $stmt->execute([UUIDHelper::generate(), $patientId, ...]);
        
        // إرجاع الاستجابة الموحدة
        Response::json(true, null, 'تم حجز الموعد بنجاح', 201);
    }
}
```
