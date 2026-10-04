<?php
$p = new PDO('mysql:host=127.0.0.1;dbname=utopia_db;charset=utf8mb4', 'root', '');
foreach ($p->query('DESCRIBE Fournisseurs') as $r) echo $r[0], ' | ';
echo PHP_EOL, 'count=', $p->query('SELECT COUNT(*) FROM Fournisseurs')->fetchColumn(), PHP_EOL;
print_r($p->query('SELECT * FROM Fournisseurs LIMIT 2')->fetchAll(PDO::FETCH_ASSOC));
