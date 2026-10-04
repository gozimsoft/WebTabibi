<?php
$sqlitePath = 'D:/Github/Utopya/Win32/Release/DBUtopia.db';
$pdo = new PDO("sqlite:" . $sqlitePath);

$stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE sql LIKE '%MessageAniv%'");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['sql'] . "\n\n";
}
