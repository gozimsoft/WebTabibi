<?php
file_put_contents('D:/Github/Utopia_react/backend/src/routes/suppliers.js', <<<'JS'
import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ID AS id,
              Raison_Social AS name,
              ContactName AS contact,
              COALESCE(NULLIF(Phone, ''), NULLIF(Fixe, '')) AS phone,
              Email AS email,
              City AS city,
              EncoursMaxi AS encoursMaxi,
              States AS active
         FROM Fournisseurs
        ORDER BY Raison_Social ASC`
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
JS);

$f = 'D:/Github/Utopia_react/frontend/src/pages/SuppliersPage.jsx';
$c = file_get_contents($f);
$c = preg_replace(
  '#useEffect\(\(\) => \{\s*fetch\(\'/api/suppliers\'\).*?\}, \[\]\);#s',
  <<<'JS'
useEffect(() => {
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(data => {
        setSuppliers(data.success && Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(() => {
        setSuppliers([]);
        setLoading(false);
      });
  }, []);
JS,
  $c, 1, $cnt);
$c = str_replace("s.name.toLowerCase()", "(s.name || '').toLowerCase()", $c);
$c = str_replace(
  "{s.encours ? `\${s.encours.toFixed(2)} €` : '0,00 €'}",
  "{Number(s.encoursMaxi || 0).toFixed(2).replace('.', ',')} €",
  $c);
$c = str_replace('<th className="py-2.5 px-3 text-right">Encours Dû</th>', '<th className="py-2.5 px-3 text-right">Encours maxi</th>', $c);
file_put_contents($f, $c);
echo "useEffect replaced: $cnt\n";
