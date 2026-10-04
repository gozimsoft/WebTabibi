<?php
$posDir = 'D:/Github/Utopia_react/backend/src/modules/pos';
$routesDir = 'D:/Github/Utopia_react/backend/src/routes';

// Fix decrementStock in pos.repository.js
$repoFile = "$posDir/pos.repository.js";
$repoContent = file_get_contents($repoFile);
$repoContent = str_replace(
    'SET QteStock = GREATEST(0, COALESCE(QteStock, 0) - ?)',
    'SET Quantite = GREATEST(0, COALESCE(Quantite, 0) - ?)',
    $repoContent
);
file_put_contents($repoFile, $repoContent);

// Fix products.js to match exact MariaDB columns
$productsRoute = <<<'JS'
import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { search = '', rayon = '', limit = 100 } = req.query;
    let sql = 'SELECT * FROM Produits WHERE 1=1';
    const params = [];

    if (search.trim()) {
      sql += ' AND (Designation LIKE ? OR Code_Barre LIKE ? OR ID LIKE ? OR Code_Articles LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (rayon.trim() && rayon.trim() !== 'Tous') {
      sql += ' AND Rayons = ?';
      params.push(rayon.trim());
    }

    sql += ' ORDER BY Designation ASC LIMIT ?';
    params.push(parseInt(limit) || 100);

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/departments', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT Rayons FROM Produits WHERE Rayons IS NOT NULL AND Rayons != "" ORDER BY Rayons ASC');
    res.json({ success: true, data: rows.map(r => r.Rayons) });
  } catch (err) {
    next(err);
  }
});

export default router;
JS;
file_put_contents("$routesDir/products.js", $productsRoute);

echo "Updated pos.repository.js and products.js with exact MariaDB column names.\n";
