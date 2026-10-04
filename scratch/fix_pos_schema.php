<?php
$posDir = 'D:/Github/Utopia_react/backend/src/modules/pos';

$repoCode = <<<'JS'
import { pool } from '../../config/db.js';

export class PosRepository {
  static async getNextInvoiceReference(connection) {
    const [rows] = await connection.query(
      'SELECT Reference FROM InvoicesVentes ORDER BY DateInvoice DESC LIMIT 1 FOR UPDATE'
    );
    let nextNum = 1;
    if (rows.length > 0 && rows[0].Reference) {
      const match = rows[0].Reference.match(/\d+/);
      if (match) nextNum = parseInt(match[0]) + 1;
    }
    return `CF-${String(nextNum).padStart(8, '0')}`;
  }

  static async insertInvoice(connection, { id, reference, totalHT, totalTVA, totalRemise, totalTTC, clientId, userId, numberPost, rendu, isFacture }) {
    const sql = `
      INSERT INTO InvoicesVentes 
      (ID, DateInvoice, Reference, Total_HT, Total_TVA, Total_Remise, Total_TTC, Client_id, User_id, NumberPost, Rendu, isFacture, PayementStatus, IsCanceled) 
      VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `;
    await connection.query(sql, [
      id,
      reference,
      totalHT || 0,
      totalTVA || 0,
      totalRemise || 0,
      totalTTC || 0,
      clientId || null,
      userId || null,
      numberPost || 'Post2',
      rendu || 0,
      isFacture ? 1 : 0
    ]);
  }

  static async insertInvoiceLine(connection, { id, invoiceId, productId, quantity, prixV, prixA, remise, tva, storeId }) {
    const sql = `
      INSERT INTO Ligne_Ventes 
      (ID, Produit_ID, InvoicesVente_ID, Quantite, Prix_V, Prix_A, Remise, Tva, Store_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.query(sql, [
      id,
      productId || null,
      invoiceId,
      quantity,
      prixV,
      prixA || 0,
      remise || 0,
      tva || 20,
      storeId || null
    ]);
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
      `SELECT v.*, c.FullName as ClientName 
       FROM InvoicesVentes v
       LEFT JOIN Clients c ON v.Client_id = c.ID
       ORDER BY v.DateInvoice DESC 
       LIMIT ?`,
      [parseInt(limit) || 100]
    );
    return rows;
  }

  static async getSalesSummary() {
    const [totals] = await pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(Total_TTC), 0) as total FROM InvoicesVentes'
    );
    return {
      totalCount: totals[0]?.count || 0,
      totalAmount: parseFloat(totals[0]?.total || 0)
    };
  }
}
JS;
file_put_contents("$posDir/pos.repository.js", $repoCode);

$serviceCode = <<<'JS'
import { pool } from '../../config/db.js';
import { PosRepository } from './pos.repository.js';
import { AuditService } from '../audit/audit.service.js';

export class PosService {
  static async checkoutSale(data, req) {
    const connection = await pool.getConnection();
    try {
      // 1. Start ACID Transaction
      await connection.beginTransaction();

      // 2. Atomic Reference Generator
      const reference = await PosRepository.getNextInvoiceReference(connection);
      const invoiceId = 'INV-' + Date.now();

      // 3. Insert Invoice Header
      await PosRepository.insertInvoice(connection, {
        id: invoiceId,
        reference,
        totalHT: data.totalHT,
        totalTVA: data.totalTVA,
        totalRemise: data.remise,
        totalTTC: data.totalTTC,
        clientId: data.clientId,
        userId: req?.user?.id || 'USR-amar',
        numberPost: req?.user?.poste || 'Post2',
        rendu: data.changeGiven,
        isFacture: data.isFacture ? 1 : 0
      });

      // 4. Insert Invoice Lines & Decrement Stock
      for (const item of data.items) {
        const lineId = 'LIG-' + Math.random().toString(36).substr(2, 9);
        await PosRepository.insertInvoiceLine(connection, {
          id: lineId,
          invoiceId,
          productId: item.id,
          quantity: item.quantity,
          prixV: item.price,
          prixA: 0,
          remise: item.remise,
          tva: item.tva,
          storeId: null
        });

        if (item.id) {
          await PosRepository.decrementStock(connection, item.id, item.quantity);
        }
      }

      // 5. Commit Transaction
      await connection.commit();

      // 6. Security Audit Log
      await AuditService.log({
        req,
        action: 'SALE_COMPLETED',
        module: 'POS',
        entityId: reference,
        details: {
          invoiceId,
          reference,
          totalTTC: data.totalTTC,
          paymentMethod: data.paymentMethod,
          itemCount: data.items.length,
          vendor: data.vendor
        }
      });

      return {
        reference,
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
file_put_contents("$posDir/pos.service.js", $serviceCode);

echo "Updated pos.repository.js and pos.service.js to match exact Delphi MariaDB schema.\n";
