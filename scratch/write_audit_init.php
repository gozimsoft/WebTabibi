<?php
$backendDir = 'D:/Github/Utopia_react/backend';

$auditInit = <<<'JS'
import { pool } from './db.js';

export async function initAuditTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS AuditLogs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(50) NULL,
      user_name VARCHAR(100) NOT NULL,
      action VARCHAR(50) NOT NULL,
      module VARCHAR(50) NOT NULL,
      entity_id VARCHAR(100) NULL,
      details JSON NULL,
      ip_address VARCHAR(45) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_name),
      INDEX idx_action (action),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(sql);
    console.log('✅ Table `AuditLogs` initialisée avec succès dans MariaDB');
  } catch (err) {
    console.error('❌ Erreur lors de la création de `AuditLogs`:', err.message);
  }
}
JS;
file_put_contents("$backendDir/src/config/initAuditDb.js", $auditInit);
echo "initAuditDb.js created.\n";
