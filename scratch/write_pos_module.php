<?php
$posDir = 'D:/Github/Utopia_react/backend/src/modules/pos';
@mkdir($posDir, 0777, true);

// pos.dto.js
$dto = <<<'JS'
import { z } from 'zod';

export const checkoutSchema = z.object({
  body: z.object({
    client: z.string().default('Client Passage'),
    clientId: z.string().nullable().optional(),
    totalHT: z.number().min(0),
    totalTVA: z.number().min(0),
    totalTTC: z.number().min(0),
    remise: z.number().min(0).default(0),
    paymentMethod: z.string().default('ESPECE'),
    cashReceived: z.number().min(0).default(0),
    changeGiven: z.number().min(0).default(0),
    vendor: z.string().min(1, 'Nom du vendeur requis'),
    items: z.array(z.object({
      id: z.string().optional().default(''),
      designation: z.string().min(1, 'Désignation requise'),
      quantity: z.number().min(0.01, 'Quantité invalide'),
      price: z.number().min(0, 'Prix invalide'),
      tva: z.number().min(0).default(20),
      remise: z.number().min(0).default(0),
      total: z.number().min(0)
    })).min(1, 'Le panier ne peut pas être vide')
  })
});
JS;
file_put_contents("$posDir/pos.dto.js", $dto);

// pos.repository.js
$repo = <<<'JS'
import { pool } from '../../config/db.js';

export class PosRepository {
  static async getNextInvoiceReference(connection) {
    const [rows] = await connection.query(
      'SELECT CodeVente FROM InvoicesVentes ORDER BY DateVente DESC LIMIT 1 FOR UPDATE'
    );
    let nextNum = 1;
    if (rows.length > 0 && rows[0].CodeVente) {
      const match = rows[0].CodeVente.match(/\d+/);
      if (match) nextNum = parseInt(match[0]) + 1;
    }
    return `CF-${String(nextNum).padStart(8, '0')}`;
  }

  static async insertInvoice(connection, { id, codeVente, totalHT, totalTVA, totalTTC, remise, paymentMethod, vendor, client }) {
    const sql = `
      INSERT INTO InvoicesVentes 
      (ID, CodeVente, DateVente, TotalHT, TotalTVA, TotalTTC, RemiseGlobale, ModePayement, Vendeur, ClientName, Statut) 
      VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, 'Paid')
    `;
    await connection.query(sql, [id, codeVente, totalHT, totalTVA, totalTTC, remise, paymentMethod, vendor, client]);
  }

  static async insertInvoiceLine(connection, { id, invoiceId, productId, designation, quantity, price, tva, remise, total }) {
    const sql = `
      INSERT INTO Ligne_Ventes 
      (ID, ID_Vente, ID_Produit, Designation, Quantite, PrixVente, Tva, Remise, TotalTTC) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.query(sql, [id, invoiceId, productId || '', designation, quantity, price, tva, remise, total]);
  }

  static async decrementStock(connection, productId, quantity) {
    if (!productId) return;
    const sql = `
      UPDATE Produits 
      SET QteStock = GREATEST(0, COALESCE(QteStock, 0) - ?) 
      WHERE ID = ?
    `;
    await connection.query(sql, [quantity, productId]);
  }

  static async listSales(limit = 100) {
    const [rows] = await pool.query(
      'SELECT * FROM InvoicesVentes ORDER BY DateVente DESC LIMIT ?',
      [parseInt(limit) || 100]
    );
    return rows;
  }

  static async getSalesSummary() {
    const [totals] = await pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(TotalTTC), 0) as total FROM InvoicesVentes'
    );
    return {
      totalCount: totals[0]?.count || 0,
      totalAmount: parseFloat(totals[0]?.total || 0)
    };
  }
}
JS;
file_put_contents("$posDir/pos.repository.js", $repo);

// pos.service.js
$service = <<<'JS'
import { pool } from '../../config/db.js';
import { PosRepository } from './pos.repository.js';
import { AuditService } from '../audit/audit.service.js';

export class PosService {
  static async checkoutSale(data, req) {
    const connection = await pool.getConnection();
    try {
      // 1. Start ACID Transaction
      await connection.beginTransaction();

      // 2. Generate Reference with atomic sequence
      const codeVente = await PosRepository.getNextInvoiceReference(connection);
      const invoiceId = 'INV-' + Date.now();

      // 3. Insert Invoice
      await PosRepository.insertInvoice(connection, {
        id: invoiceId,
        codeVente,
        totalHT: data.totalHT,
        totalTVA: data.totalTVA,
        totalTTC: data.totalTTC,
        remise: data.remise,
        paymentMethod: data.paymentMethod,
        vendor: data.vendor,
        client: data.client
      });

      // 4. Insert each line & update stock
      for (const item of data.items) {
        const lineId = 'LIG-' + Math.random().toString(36).substr(2, 9);
        await PosRepository.insertInvoiceLine(connection, {
          id: lineId,
          invoiceId,
          productId: item.id,
          designation: item.designation,
          quantity: item.quantity,
          price: item.price,
          tva: item.tva,
          remise: item.remise,
          total: item.total
        });

        // Decrement stock
        if (item.id) {
          await PosRepository.decrementStock(connection, item.id, item.quantity);
        }
      }

      // 5. Commit Transaction
      await connection.commit();

      // 6. Asynchronous Audit Logging
      await AuditService.log({
        req,
        action: 'SALE_COMPLETED',
        module: 'POS',
        entityId: codeVente,
        details: {
          invoiceId,
          codeVente,
          totalTTC: data.totalTTC,
          paymentMethod: data.paymentMethod,
          itemCount: data.items.length,
          vendor: data.vendor
        }
      });

      return {
        reference: codeVente,
        invoiceId,
        date: new Date().toISOString(),
        totalTTC: data.totalTTC
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async getSalesJournal(limit = 100) {
    const sales = await PosRepository.listSales(limit);
    const summary = await PosRepository.getSalesSummary();
    return { sales, summary };
  }
}
JS;
file_put_contents("$posDir/pos.service.js", $service);

// pos.controller.js
$controller = <<<'JS'
import { PosService } from './pos.service.js';

export class PosController {
  static async checkout(req, res, next) {
    try {
      const result = await PosService.checkoutSale(req.body, req);
      res.json({
        success: true,
        message: 'Vente enregistrée avec succès sous transaction ACID',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async getJournal(req, res, next) {
    try {
      const result = await PosService.getSalesJournal(req.query.limit);
      res.json({
        success: true,
        data: result.sales,
        summary: result.summary
      });
    } catch (err) {
      next(err);
    }
  }
}
JS;
file_put_contents("$posDir/pos.controller.js", $controller);

// pos.routes.js
$routes = <<<'JS'
import express from 'express';
import { PosController } from './pos.controller.js';
import { validate } from '../../middleware/validate.js';
import { checkoutSchema } from './pos.dto.js';

const router = express.Router();

router.post('/checkout', validate(checkoutSchema), PosController.checkout);
router.get('/journal', PosController.getJournal);

export default router;
JS;
file_put_contents("$posDir/pos.routes.js", $routes);

echo "POS module with ACID transactions created.\n";
