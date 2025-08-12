<?php
// إنشاء أو الاتصال بقاعدة بيانات SQLite
$db = new PDO('sqlite:database.sqlite');

// إنشاء جدول المستخدمين إذا لم يكن موجودًا
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    points INTEGER DEFAULT 0
)");
// إنشاء جدول عمليات الدفع إذا لم يكن موجودًا
$db->exec("CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    points INTEGER,
    status TEXT,
    payment_method TEXT,
    transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)");
?>
