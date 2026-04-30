<?php
// ============================================================
// test_email.php — Test direct SMTP Gmail
// http://localhost/tabibi/backend/test_email.php
// ============================================================

$MAIL_HOST = 'smtp.gmail.com';
$MAIL_USER = 'stellarsoftpro@gmail.com';
$MAIL_PASS = 'equi uawa usrl wpor';
$MAIL_PORT = 587;
$MAIL_NAME = 'Tabibi - طبيبي';

// ⬇️ Votre email de destination pour le test
$toEmail = 'stellarsoftpro@gmail.com';
$toName  = 'Test Patient';

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family:Arial;padding:30px'>";
echo "<h2>🔧 Test SMTP Tabibi</h2>";
echo "<p>Connexion à <b>{$MAIL_HOST}:{$MAIL_PORT}</b> avec <b>{$MAIL_USER}</b></p>";

// ── 1. Test connexion socket ──────────────────────────────
$errno = $errstr = '';
echo "<p>⏳ Ouverture socket...</p>";
flush();

$sock = @fsockopen($MAIL_HOST, $MAIL_PORT, $errno, $errstr, 15);
if (!$sock) {
    die("<p style='color:red'>❌ Impossible de se connecter : {$errstr} (errno: {$errno})</p></body></html>");
}

echo "<p style='color:green'>✅ Socket connecté</p>";
flush();

// ── 2. Dialogue SMTP ──────────────────────────────────────
$steps = [];

$read = function() use ($sock, &$steps) {
    $r = '';
    while (!feof($sock)) {
        $line = fgets($sock, 515);
        $r .= $line;
        if (isset($line[3]) && $line[3] === ' ') break;
    }
    $steps[] = ['<', trim($r)];
    return $r;
};

$write = function(string $cmd) use ($sock, &$steps) {
    $steps[] = ['>', trim($cmd)];
    fputs($sock, $cmd . "\r\n");
};

$read(); // 220 greeting

$write("EHLO tabibi.app");
$read();

$write("STARTTLS");
$startTlsRes = $read();
if (strpos($startTlsRes, '220') === false) {
    fclose($sock);
    echo "<p style='color:red'>❌ STARTTLS refusé: " . htmlspecialchars($startTlsRes) . "</p>";
    die("</body></html>");
}

// Upgrade TLS
if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
    fclose($sock);
    die("<p style='color:red'>❌ Impossible d'activer TLS (vérifiez l'extension openssl PHP)</p></body></html>");
}

echo "<p style='color:green'>✅ TLS activé</p>";
flush();

$write("EHLO tabibi.app");
$read();

$write("AUTH LOGIN");
$read();

$write(base64_encode($MAIL_USER));
$read();

$write(base64_encode($MAIL_PASS));
$authRes = $read();

if (strpos($authRes, '235') === false) {
    fclose($sock);
    echo "<p style='color:red'>❌ Authentification échouée: " . htmlspecialchars($authRes) . "</p>";
    echo "<p>Vérifiez : mot de passe d'application Gmail (16 caractères sans espaces)</p>";
    die("</body></html>");
}

echo "<p style='color:green'>✅ Authentifié avec succès</p>";
flush();

// ── 3. Envoi de l'email ───────────────────────────────────
$write("MAIL FROM:<{$MAIL_USER}>");
$read();

$write("RCPT TO:<{$toEmail}>");
$rcptRes = $read();

if (strpos($rcptRes, '250') === false) {
    fclose($sock);
    echo "<p style='color:red'>❌ Destinataire refusé: " . htmlspecialchars($rcptRes) . "</p>";
    die("</body></html>");
}

$write("DATA");
$read();

$boundary = md5(uniqid());
$subject  = '=?UTF-8?B?' . base64_encode('✅ Test Email Tabibi') . '?=';
$fromEnc  = '=?UTF-8?B?' . base64_encode($MAIL_NAME) . '?=';
$toEnc    = '=?UTF-8?B?' . base64_encode($toName) . '?=';

$htmlBody = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"></head>
<body style="font-family:Arial;background:#f0f4f8;padding:30px">
<div style="max-width:600px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.1)">
  <div style="background:linear-gradient(135deg,#0c4a6e,#0891b2,#06b6d4);padding:36px;text-align:center">
    <div style="color:#fff;font-size:28px;font-weight:900">طبيبي — Tabibi</div>
    <div style="color:rgba(255,255,255,.8);font-size:14px;margin-top:6px">منصة حجز المواعيد الطبية</div>
  </div>
  <div style="padding:30px;text-align:right">
    <div style="text-align:center;margin-bottom:24px">
      <span style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;font-size:16px;font-weight:800;padding:14px 32px;border-radius:50px;display:inline-block">
        ✅ نظام الإيميل يعمل بشكل صحيح!
      </span>
    </div>
    <p style="color:#1e293b;font-size:16px">هذا إيميل اختبار من منصة طبيبي.</p>
    <p style="color:#64748b;font-size:14px">إذا استلمت هذا الإيميل، فإن نظام التأكيد التلقائي يعمل بشكل صحيح ✓</p>
  </div>
  <div style="background:#f8fafc;padding:18px 30px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="margin:0;color:#94a3b8;font-size:12px">Tabibi © ' . date('Y') . '</p>
  </div>
</div>
</body></html>';

$headers  = "From: {$fromEnc} <{$MAIL_USER}>\r\n";
$headers .= "To: {$toEnc} <{$toEmail}>\r\n";
$headers .= "Subject: {$subject}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
$headers .= "Date: " . date('r') . "\r\n";

$msgBody  = "--{$boundary}\r\n";
$msgBody .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
$msgBody .= "Test email from Tabibi. If you received this, SMTP is working.\r\n";
$msgBody .= "--{$boundary}\r\n";
$msgBody .= "Content-Type: text/html; charset=UTF-8\r\n";
$msgBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
$msgBody .= chunk_split(base64_encode($htmlBody)) . "\r\n";
$msgBody .= "--{$boundary}--\r\n";

fputs($sock, $headers . "\r\n" . $msgBody . "\r\n.\r\n");
$dotRes = $read();

$write("QUIT");
fclose($sock);

// ── 4. Résultat ───────────────────────────────────────────
echo "<hr>";
if (strpos($dotRes, '250') !== false) {
    echo "<h2 style='color:green'>✅ Email envoyé avec succès à {$toEmail} !</h2>";
    echo "<p>Vérifiez votre boîte mail (et les <b>spams</b>).</p>";
} else {
    echo "<h2 style='color:red'>❌ Échec lors de l'envoi</h2>";
    echo "<p>Réponse serveur: " . htmlspecialchars($dotRes) . "</p>";
}

// Afficher le journal SMTP
echo "<details style='margin-top:20px'><summary style='cursor:pointer;font-weight:bold'>📋 Journal SMTP</summary><pre style='background:#1e293b;color:#94a3b8;padding:16px;border-radius:8px;font-size:12px;margin-top:8px'>";
foreach ($steps as [$dir, $msg]) {
    $color = $dir === '>' ? '#38bdf8' : '#86efac';
    echo "<span style='color:{$color}'>{$dir}</span> " . htmlspecialchars($msg) . "\n";
}
echo "</pre></details>";

echo "</body></html>";
