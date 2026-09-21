<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$start = microtime(true);

// 1. Users by usertype
$uStmt = $pdo->query("SELECT usertype, COUNT(*) as c FROM users GROUP BY usertype");
$usersByType = [];
$totalUsers = 0;
foreach ($uStmt->fetchAll() as $row) {
    $usersByType[(int)$row['usertype']] = (int)$row['c'];
    $totalUsers += (int)$row['c'];
}

// 2. Patients summary
$pStmt = $pdo->query("
    SELECT 
        SUM(CASE WHEN (deleteacount = 0 OR deleteacount IS NULL) AND (is_frozen = 0 OR is_frozen IS NULL) THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_frozen = 1 THEN 1 ELSE 0 END) as frozen,
        SUM(CASE WHEN deleteacount = 1 THEN 1 ELSE 0 END) as deleted
    FROM patients
");
$pRow = $pStmt->fetch() ?: [];

// 3. Doctors summary
$dStmt = $pdo->query("
    SELECT 
        SUM(CASE WHEN status = 'APPROVED' AND (is_frozen = 0 OR is_frozen IS NULL) THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN is_frozen = 1 THEN 1 ELSE 0 END) as frozen
    FROM doctors
");
$dRow = $dStmt->fetch() ?: [];

// 4. Clinics summary
$cStmt = $pdo->query("
    SELECT 
        SUM(CASE WHEN status = 'APPROVED' AND (is_frozen = 0 OR is_frozen IS NULL) THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN is_frozen = 1 THEN 1 ELSE 0 END) as frozen
    FROM clinics
");
$cRow = $cStmt->fetch() ?: [];

// 5. Sessions summary
$sStmt = $pdo->query("
    SELECT 
        COUNT(*) as total_active,
        COUNT(DISTINCT user_id) as users_active
    FROM sessions
");
$sRow = $sStmt->fetch() ?: [];

$stats = [
    'total_users' => $totalUsers,
    'patients' => [
        'total'   => $usersByType[0] ?? 0,
        'active'  => (int)($pRow['active'] ?? 0),
        'frozen'  => (int)($pRow['frozen'] ?? 0),
        'deleted' => (int)($pRow['deleted'] ?? 0),
    ],
    'doctors' => [
        'total'    => $usersByType[1] ?? 0,
        'approved' => (int)($dRow['approved'] ?? 0),
        'pending'  => (int)($dRow['pending'] ?? 0),
        'frozen'   => (int)($dRow['frozen'] ?? 0),
    ],
    'clinics' => [
        'total'    => $usersByType[2] ?? 0,
        'approved' => (int)($cRow['approved'] ?? 0),
        'pending'  => (int)($cRow['pending'] ?? 0),
        'frozen'   => (int)($cRow['frozen'] ?? 0),
    ],
    'admins' => [
        'superadmin' => $usersByType[3] ?? 0,
        'staff'      => $usersByType[4] ?? 0,
    ],
    'sessions' => [
        'total_active' => (int)($sRow['total_active'] ?? 0),
        'users_active' => (int)($sRow['users_active'] ?? 0),
    ]
];

$duration = round((microtime(true) - $start) * 1000, 2);
echo "Optimized compute time: {$duration} ms\n";
print_r($stats);
