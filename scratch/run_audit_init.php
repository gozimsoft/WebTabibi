<?php
$mysqli = new mysqli("127.0.0.1", "root", "", "utopia_db");
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error . "\n");
}

$sql = "
CREATE TABLE IF NOT EXISTS `AuditLogs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `entity_id` VARCHAR(100) NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_name`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

if ($mysqli->query($sql)) {
    echo "Successfully created table `AuditLogs` in utopia_db!\n";
} else {
    echo "Error: " . $mysqli->error . "\n";
}

$res = $mysqli->query("DESCRIBE AuditLogs");
while ($row = $res->fetch_assoc()) {
    printf("%-15s %-20s %s\n", $row['Field'], $row['Type'], $row['Null']);
}
