<?php
session_start();
header('Content-Type: application/json');
include 'controller.php';
include 'database.php';

if (!isset($_SESSION['username'])) {
    echo json_encode(['state' => 0, 'message' => 'يجب تسجيل الدخول أولاً.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $NameProject = filter_input(INPUT_POST, 'projectName', FILTER_SANITIZE_STRING);
    if (empty($NameProject)) {
        echo json_encode(['state' => 0, 'message' => 'يجب ادخال اسم المشروع .']);
        exit;
    }
    if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['state' => 0, 'message' => 'فشل رفع الملف.']);
        exit();
    }
    // جلب نقاط المستخدم من قاعدة البيانات
    $userId = $_SESSION['user_id'];
    $stmt = $db->prepare("SELECT points FROM users WHERE id = :id");
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $userPoints = $user['points'];
    if ($userPoints < 1) {
        $response['state'] = 4;
        echo json_encode(['state' => 0, 'message' => 'لا يوجد عدد كافي من النقاط ..']);
        exit;
    }

    $uploadedFile = $_FILES['file']['tmp_name'];
    $_SESSION['db_file'] = $uploadedFile;
    $fileType = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    $tablesData = [];

    try {
        if ($fileType == 'db' || $fileType == 'sqlite') {
            $pdo = new PDO("sqlite:" . $uploadedFile);
            $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table';");
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $tableName = $row['name'];
                $fields = [];

                // جلب الحقول
                $stmtFields = $pdo->query("PRAGMA table_info($tableName);");
                while ($field = $stmtFields->fetch(PDO::FETCH_ASSOC)) {
                    $fields[] = ['name' => $field['name'], 'type' => $field['type']];
                }

                // إضافة الجدول وحقوله إلى القائمة
                $tablesData[] = ['table' => $tableName, 'fields' => $fields];
            }

        } elseif ($fileType == 'accdb' || $fileType == 'mdb') {
            $dsn = "odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=" . $uploadedFile . ";";
            $pdo = new PDO($dsn);

            // جلب أسماء الجداول
            $stmt = $pdo->query("SELECT Name FROM MSysObjects WHERE Type=1 AND Flags=0;");
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $tableName = $row['Name'];
                $fields = [];

                // جلب الحقول
                $stmtFields = $pdo->query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$tableName';");
                while ($field = $stmtFields->fetch(PDO::FETCH_ASSOC)) {
                    $fields[] = ['name' => $field['COLUMN_NAME'], 'type' => $field['DATA_TYPE']];
                }

                // إضافة الجدول وحقوله إلى القائمة
                $tablesData[] = ['table' => $tableName, 'fields' => $fields];
            }
        }

        function CheckIsPrimaryKey($_NameFiled)
        {
            if (strtoupper($_NameFiled) == 'ID') {
                return true;
            } else {
                return false;
            }
        }
        function CheckIsForeignKey($_NameFiled)
        {
            return substr(strtoupper($_NameFiled), -3) === '_ID';
        }

        function mapDataType($dbType)
        {
            // تحويل إلى أحرف كبيرة وإزالة أي مسافات إضافية
            $dbType = strtoupper(trim($dbType));

            // تطابق الأنواع المختلفة وتحويلها
            if (preg_match('/^(CHAR|VARCHAR|TEXT|NVARCHAR|NCHAR)/', $dbType)) {
                return 'String';
            }
            if (preg_match('/^(INT|INTEGER|TINYINT|SMALLINT|BIGINT)/', $dbType)) {
                return 'Integer';
            }
            if (preg_match('/^(FLOAT|DOUBLE|DECIMAL|NUMERIC)/', $dbType)) {
                return 'Float'; // يمكنك إعادته كـ integer إذا كنت تعتبرها عددًا صحيحًا
            }
            if (preg_match('/^(BIT|BOOLEAN)/', $dbType)) {
                return 'Boolean';
            }
            if (preg_match('/^(DATE|TIME|DATETIME|TIMESTAMP)/', $dbType)) {
                return 'DateTime';
            }
            if (preg_match('/^(BLOB|IMAGE|VARBINARY|BINARY)/', $dbType)) {
                return 'Image'; 
            }

            return '';
        }
        function CreateUniqueFolder($baseDir = 'uploads/')
        {
            do {
                $folderName = md5(uniqid(mt_rand(), true));
                $folderPath = $baseDir . $folderName;
            } while (file_exists($folderPath)); // التأكد من عدم تكرار الاسم        
            mkdir($folderPath, 0755, true); // إنشاء المجلد مع إعطاء صلاحيات كاملة
            return $folderName;
        }

        function PreparyData($tablesData)
        {
            $result = [];
            foreach ($tablesData as $table) {
                if (!isset($table['table']) || !isset($table['fields']) || !is_array($table['fields'])) {
                    continue; // تخطي الإدخالات غير الصحيحة
                }
                $NameTable = $table['table'];
                $NameClass = substr($NameTable, 0, -1);
                $tableData = [
                    'table_name' => $NameTable,
                    'class_name' => $NameClass,
                    'fields' => []
                ];

                foreach ($table['fields'] as $field) {
                    if (!isset($field['name']) || !isset($field['type'])) {
                        continue; // تخطي الحقول غير الصحيحة
                    }

                    $NameField = $field['name'];
                    $TypeField = mapDataType($field['type']);
                    $IsPrimaryKey = CheckIsPrimaryKey($NameField);
                    $IsForeignKey = CheckIsForeignKey($NameField);

                    $tableData['fields'][] = [
                        'field_name' => $NameField,
                        'field_type' => $TypeField,
                        'is_primary' => $IsPrimaryKey,
                        'is_foreign' => $IsForeignKey
                    ];
                }

                $result[] = $tableData;
            }
            return $result;
        }
        $FolderProject = CreateUniqueFolder();
        $zipFilePath = GeneratorProject($FolderProject, $NameProject, PreparyData($tablesData));
        if ($zipFilePath != '') {
            // تحديث نقاط المستخدم
            $userPoints = $userPoints - 1;
            $stmt = $db->prepare("UPDATE users SET points = :points WHERE id = :id");
            $stmt->bindParam(':points', $userPoints);
            $stmt->bindParam(':id', $userId);
            $stmt->execute();
            // 
            echo json_encode(['state' => 1, 'download_link' => $zipFilePath, 'userPoints' => $userPoints]);
        }
         else {
            echo json_encode(['state' => 0, 'message' => 'فشلة محاولة معالجة الملف .' . $e->getMessage()]);
        }

    } catch (Exception $e) {
        echo json_encode(['state' => 0, 'message' => 'خطأ في الاتصال بقاعدة البيانات: ' . $e->getMessage()]);
    }
    
}



?>