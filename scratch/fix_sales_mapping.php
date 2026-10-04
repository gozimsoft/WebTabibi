<?php
$f = 'D:/Github/Utopia_react/frontend/src/pages/PosPage.jsx';
$c = file_get_contents($f);
$n = 0;
$c = str_replace("type: s.isFacture === '1' ? 'Facture' : 'Ticket',", "type: Number(s.isFacture) === 1 ? 'Facture' : 'Ticket',", $c, $a); $n += $a;
$c = str_replace("paiement: 'Paid',\n            client: s.Client_id || 'khaledrandji'", "paiement: Number(s.PayementStatus) === 1 ? 'Paid' : 'Non payé',\n            client: s.ClientName || 'Client passage'", $c, $b); $n += $b;
$c = str_replace("paiement: 'Paid',\r\n            client: s.Client_id || 'khaledrandji'", "paiement: Number(s.PayementStatus) === 1 ? 'Paid' : 'Non payé',\r\n            client: s.ClientName || 'Client passage'", $c, $d); $n += $d;
file_put_contents($f, $c);
echo "Replacements: $n\n";
