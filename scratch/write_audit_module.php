<?php
$auditDir = 'D:/Github/Utopia_react/backend/src/modules/audit';
@mkdir($auditDir, 0777, true);

// audit.repository.js
$repo = <<<'JS'
import { pool } from '../../config/db.js';

export class AuditRepository {
  static async insertLog({ userId, userName, action, module, entityId, details, ipAddress }) {
    const sql = `
      INSERT INTO AuditLogs (user_id, user_name, action, module, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      userId || null,
      userName || 'System',
      action,
      module,
      entityId ? String(entityId) : null,
      details ? JSON.stringify(details) : null,
      ipAddress || null
    ]);
    return result.insertId;
  }

  static async getRecentLogs(limit = 100) {
    const sql = `
      SELECT * FROM AuditLogs 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [parseInt(limit) || 100]);
    return rows;
  }
}
JS;
file_put_contents("$auditDir/audit.repository.js", $repo);

// audit.service.js
$service = <<<'JS'
import { AuditRepository } from './audit.repository.js';

export class AuditService {
  static async log({ req, action, module, entityId = null, details = null }) {
    const userId = req?.user?.id || null;
    const userName = req?.user?.name || req?.body?.vendor || 'amar';
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';

    return AuditRepository.insertLog({
      userId,
      userName,
      action,
      module,
      entityId,
      details,
      ipAddress
    });
  }

  static async listLogs(limit = 100) {
    return AuditRepository.getRecentLogs(limit);
  }
}
JS;
file_put_contents("$auditDir/audit.service.js", $service);

// audit.routes.js
$routes = <<<'JS'
import express from 'express';
import { AuditService } from './audit.service.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const logs = await AuditService.listLogs(req.query.limit || 50);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
});

export default router;
JS;
file_put_contents("$auditDir/audit.routes.js", $routes);

echo "Audit module files created.\n";
