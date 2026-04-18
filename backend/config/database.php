<?php
// ============================================================
// config/database.php  —  Tabibi API
// ============================================================

define('DB_HOST',     '178.32.109.176');
define('DB_PORT',     '3306');
define('DB_NAME',     'uyyuppcc_DBTabibi');
define('DB_USER',     'uyyuppcc_admin');          // ← change in production
define('DB_PASS',     'EV]s6^lwR0OnG029');              // ← change in production
define('DB_CHARSET',  'utf8mb4');

// Email (PHPMailer / SMTP)
define('MAIL_HOST',   'smtp.gmail.com');
define('MAIL_USER',   'noreply@tabibi.dz');
define('MAIL_PASS',   'your_app_password');
define('MAIL_PORT',   587);
define('MAIL_NAME',   'Tabibi - طبيبي');

// App
define('APP_URL',     'http://localhost:8000'); // http://localhost:8000
define('FRONTEND_URL','http://localhost:5173');

// Session / Token expiry (seconds)
define('TOKEN_EXPIRY', 86400 * 30); // 30 days
