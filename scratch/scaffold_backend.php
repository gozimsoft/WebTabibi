<?php
$backendDir = 'D:/Github/Utopia_react/backend';
@mkdir("$backendDir/src/routes", 0777, true);
@mkdir("$backendDir/src/config", 0777, true);

// package.json
$pkg = [
    "name" => "utopia-backend",
    "version" => "1.0.0",
    "main" => "src/server.js",
    "type" => "module",
    "scripts" => [
        "start" => "node src/server.js",
        "dev" => "node --watch src/server.js"
    ],
    "dependencies" => [
        "cors" => "^2.8.5",
        "dotenv" => "^16.4.5",
        "express" => "^4.19.2",
        "mysql2" => "^3.11.0"
    ]
];
file_put_contents("$backendDir/package.json", json_encode($pkg, JSON_PRETTY_PRINT));

// .env
$env = "PORT=5001\nDB_HOST=127.0.0.1\nDB_USER=root\nDB_PASS=\nDB_NAME=utopia_db\n";
file_put_contents("$backendDir/.env", $env);

// db.js
$dbJs = <<<'JS'
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'utopia_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  charset: 'utf8mb4'
});

export async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 as val');
    console.log('✅ MariaDB connected to utopia_db successfully');
  } catch (err) {
    console.error('❌ MariaDB connection error:', err.message);
  }
}
JS;
file_put_contents("$backendDir/src/config/db.js", $dbJs);

echo "Scaffolded backend files successfully.\n";
