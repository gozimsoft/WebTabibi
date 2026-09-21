<?php
// ============================================================
// helpers/EmailHelper.php  â€” SMTP natif (sans PHPMailer)
// ============================================================
require_once __DIR__ . '/../config/database.php';

class EmailHelper {

    /**
     * Envoie un email via SMTP (Gmail) sans dأ©pendance externe.
     */
    private static function sendSmtp(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlBody,
        string $textBody = ''
    ): bool {
        $host     = MAIL_HOST;   
        $port     = MAIL_PORT;   
        $user     = MAIL_USER;
        $pass     = MAIL_PASS;
        $fromName = MAIL_NAME;

        $errno = $errstr = '';
        $sock = @fsockopen($host, $port, $errno, $errstr, 10);
        if (!$sock) {
            error_log("[Tabibi Email] Cannot connect to {$host}:{$port} â€” {$errstr}");
            return false;
        }

        $read = function() use ($sock) {
            $r = '';
            while (!feof($sock)) {
                $line = fgets($sock, 515);
                $r .= $line;
                if (isset($line[3]) && $line[3] === ' ') break;
            }
            return $r;
        };
        $write = function(string $cmd) use ($sock) {
            fputs($sock, $cmd . "\r\n");
        };

        $read(); 
        $write("EHLO " . gethostname());
        $read();
        $write("STARTTLS");
        $read();

        stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

        $write("EHLO " . gethostname());
        $read();
        $write("AUTH LOGIN");
        $read();
        $write(base64_encode($user));
        $read();
        $write(base64_encode($pass));
        $res = $read();
        if (strpos($res, '235') === false) {
            error_log("[Tabibi Email] AUTH failed: " . $res);
            fclose($sock);
            return false;
        }

        $write("MAIL FROM:<{$user}>");
        $read();
        $write("RCPT TO:<{$toEmail}>");
        $rcptRes = $read();
        if (strpos($rcptRes, '250') === false) {
            error_log("[Tabibi Email] RCPT rejected for {$toEmail}: " . $rcptRes);
            fclose($sock);
            return false;
        }
        $write("DATA");
        $read();

        $boundary = md5(uniqid());
        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $encodedFrom    = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
        $encodedTo      = '=?UTF-8?B?' . base64_encode($toName) . '?=';

        $headers  = "From: {$encodedFrom} <{$user}>\r\n";
        $headers .= "To: {$encodedTo} <{$toEmail}>\r\n";
        $headers .= "Subject: {$encodedSubject}\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
        $headers .= "Date: " . date('r') . "\r\n";

        $body  = "--{$boundary}\r\n";
        $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $body .= chunk_split(base64_encode($textBody ?: strip_tags($htmlBody))) . "\r\n";
        $body .= "--{$boundary}\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $body .= chunk_split(base64_encode($htmlBody)) . "\r\n";
        $body .= "--{$boundary}--\r\n";

        fputs($sock, $headers . "\r\n" . $body . "\r\n.\r\n");
        $dotRes = $read();

        $write("QUIT");
        fclose($sock);

        return (strpos($dotRes, '250') !== false);
    }

    public static function sendAppointmentConfirmation(
        string $toEmail,
        string $toName,
        string $doctorname,
        string $clinicname,
        string $appointmentDate
    ): bool {
        $subject = 'طھط£ظƒظٹط¯ ظ…ظˆط¹ط¯ظƒ | Confirmation de rendez-vous - Tabibi';
        $html    = self::buildConfirmationTemplate($toName, $doctorname, $clinicname, $appointmentDate);
        $text    = "ظ…ط±ط­ط¨ط§ظ‹ {$toName}طŒ طھظ… طھط£ظƒظٹط¯ ظ…ظˆط¹ط¯ظƒ ظ…ط¹ {$doctorname} ظپظٹ {$clinicname} ط¨طھط§ط±ظٹط® {$appointmentDate}.";
        return self::sendSmtp($toEmail, $toName, $subject, $html, $text);
    }

    public static function sendAppointmentCancellation(
        string $toEmail,
        string $toName,
        string $appointmentDate
    ): bool {
        $subject = 'ط¥ظ„ط؛ط§ط، ظ…ظˆط¹ط¯ظƒ | Annulation - Tabibi';
        $html    = self::buildCancellationTemplate($toName, $appointmentDate);
        $text    = "ظ…ط±ط­ط¨ط§ظ‹ {$toName}طŒ طھظ… ط¥ظ„ط؛ط§ط، ظ…ظˆط¹ط¯ظƒ ط¨طھط§ط±ظٹط® {$appointmentDate}.";
        return self::sendSmtp($toEmail, $toName, $subject, $html, $text);
    }

    public static function sendPasswordReset(
        string $toEmail,
        string $toName,
        string $otpCode
    ): bool {
        $subject = 'ط¥ط¹ط§ط¯ط© طھط¹ظٹظٹظ† ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± | Rأ©initialisation du mot de passe - Tabibi';
        $html    = self::buildPasswordResetTemplate($toName, $otpCode);
        $text    = "ظ…ط±ط­ط¨ط§ظ‹ {$toName}طŒ ظƒظˆط¯ ط§ط³طھط¹ط§ط¯ط© ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط®ط§طµ ط¨ظƒ ظ‡ظˆ: {$otpCode}. ط§ظ„ط±ظ…ط² طµط§ظ„ط­ ظ„ظ…ط¯ط© 15 ط¯ظ‚ظٹظ‚ط©.";
        return self::sendSmtp($toEmail, $toName, $subject, $html, $text);
    }

    // ----------------------------------------------------------
    // ط¥ط±ط³ط§ظ„ ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¯ط®ظˆظ„ ط¹ظ†ط¯ ظ‚ط¨ظˆظ„ ط­ط³ط§ط¨ ط§ظ„ط·ط¨ظٹط¨ ط£ظˆ ط§ظ„ط¹ظٹط§ط¯ط© ظ…ظ† ظ„ظˆط­ط© ط§ظ„ظ…ط·ظˆط±/ط§ظ„ط£ط¯ظ…ظ†
    // ----------------------------------------------------------
    public static function sendApprovalCredentials(
        string $toEmail,
        string $toName,
        string $accountType,
        string $username,
        ?string $plainPassword = null
    ): bool {
        $typeLabel = ($accountType === 'clinic') ? 'ط§ظ„ط¹ظٹط§ط¯ط©' : 'ط§ظ„ط·ط¨ظٹط¨';
        $subject   = "ًںژ‰ طھظ… ظ‚ط¨ظˆظ„ ط·ظ„ط¨ ط§ظ†ط¶ظ…ط§ظ… {$typeLabel} - ط¨ظٹط§ظ†ط§طھ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ | Tabibi ط·ط¨ظٹط¨ظٹ";
        $html      = self::buildApprovalCredentialsTemplate($toName, $accountType, $username, $toEmail, $plainPassword);
        $loginUrl  = (defined('FRONTEND_URL') ? rtrim(FRONTEND_URL, '/') : 'http://localhost:80') . '/#/login';
        // PHASE 02B : Si $plainPassword est null (hash Bcrypt), on ne peut pas afficher le mot de passe en clair
        $passwordLine = $plainPassword
            ? "- ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±: {$plainPassword}"
            : "- ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±: ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„طھظٹ ط§ط®طھط±طھظ‡ط§ ط¹ظ†ط¯ ط§ظ„طھط³ط¬ظٹظ„";
        $text      = "ظ…ط±ط­ط¨ط§ظ‹ {$toName}طŒ\n\nظٹط³ط±ظ†ط§ ط¥ط¨ظ„ط§ط؛ظƒ ط¨ط£ظ†ظ‡ طھظ…طھ ط§ظ„ظ…ظˆط§ظپظ‚ط© ط¹ظ„ظ‰ ط·ظ„ط¨ ط§ظ†ط¶ظ…ط§ظ…ظƒ ط¥ظ„ظ‰ ظ…ظ†طµط© ط·ط¨ظٹط¨ظٹ (Tabibi).\n\nط¨ظٹط§ظ†ط§طھ ط§ظ„ط¯ط®ظˆظ„ ط¥ظ„ظ‰ ط­ط³ط§ط¨ظƒ:\n- ظ†ظˆط¹ ط§ظ„ط­ط³ط§ط¨: {$typeLabel}\n- ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ…: {$username}\n- ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ: {$toEmail}\n{$passwordLine}\n\nط±ط§ط¨ط· طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„: {$loginUrl}\n\nظپط±ظٹظ‚ ظ…ظ†طµط© ط·ط¨ظٹط¨ظٹ";
        return self::sendSmtp($toEmail, $toName, $subject, $html, $text);
    }

    // ----------------------------------------------------------
    // ط¥ط±ط³ط§ظ„ ط±ظ…ط² ط§ظ„طھط­ظ‚ظ‚ OTP (طھط³ط¬ظٹظ„ ط­ط³ط§ط¨ ط¬ط¯ظٹط¯ ط£ظˆ طھط£ظƒظٹط¯ ط§ظ„ط¥ظٹظ…ظٹظ„)
    // ----------------------------------------------------------
    public static function sendOTP(
        string $toEmail,
        string $toName,
        string $otpCode
    ): bool {
        $subject = 'ًں”گ ط±ظ…ط² ط§ظ„طھط­ظ‚ظ‚ | Code de vأ©rification â€” Tabibi ط·ط¨ظٹط¨ظٹ';
        $html    = self::buildOTPTemplate($toName, $otpCode);
        $text    = "ظ…ط±ط­ط¨ط§ظ‹ {$toName}طŒ ط±ظ…ط² ط§ظ„طھط­ظ‚ظ‚ ط§ظ„ط®ط§طµ ط¨ظƒ ظ‡ظˆ: {$otpCode}. ط§ظ„ط±ظ…ط² طµط§ظ„ط­ ظ„ظ…ط¯ط© 10 ط¯ظ‚ط§ط¦ظ‚.";
        return self::sendSmtp($toEmail, $toName, $subject, $html, $text);
    }

    // ----------------------------------------------------------
    // ظ‚ط§ظ„ط¨ HTML ظ„ط±ط³ط§ظ„ط© OTP (طھط³ط¬ظٹظ„ / طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„ط¥ظٹظ…ظٹظ„)
    // ----------------------------------------------------------
    private static function buildOTPTemplate(string $toName, string $otpCode): string {
        $year = date('Y');
        return <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, Tahoma, sans-serif; }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Tajawal',Arial,sans-serif;">
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr>
        <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">

                <!-- HEADER -->
                <tr>
                    <td style="background:linear-gradient(135deg,#0369a1,#0891b2,#06b6d4);padding:45px 40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:36px;font-weight:900;letter-spacing:1px;">ط·ط¨ظٹط¨ظٹ <span style="font-size:20px;font-weight:400;opacity:0.8;">Tabibi</span></h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">طµط­طھظƒظ…طŒ ط£ظˆظ„ظˆظٹطھظ†ط§</p>
                    </td>
                </tr>

                <!-- BADGE -->
                <tr>
                    <td align="center" style="padding:0 40px;">
                        <div style="display:inline-block;background-color:#ffffff;padding:12px 30px;border-radius:50px;margin-top:-30px;box-shadow:0 10px 25px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">
                            <table border="0" cellspacing="0" cellpadding="0"><tr>
                                <td style="padding-left:10px;color:#0ea5e9;font-size:16px;font-weight:700;">ًں”گ طھط£ظƒظٹط¯ ط¥ظ†ط´ط§ط، ط§ظ„ط­ط³ط§ط¨</td>
                            </tr></table>
                        </div>
                    </td>
                </tr>

                <!-- GREETING -->
                <tr>
                    <td style="padding:40px 40px 20px;text-align:right;">
                        <p style="margin:0;color:#1e293b;font-size:20px;font-weight:700;">ظ…ط±ط­ط¨ط§ظ‹ {$toName}طŒ</p>
                        <p style="margin:10px 0 0;color:#64748b;font-size:14px;line-height:1.6;">ط´ظƒط±ط§ظ‹ ظ„طھط³ط¬ظٹظ„ظƒ ظپظٹ ظ…ظ†طµط© ط·ط¨ظٹط¨ظٹ! ظ„ط¥ظƒظ…ط§ظ„ ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨ظƒطŒ ظٹط±ط¬ظ‰ ط§ط³طھط®ط¯ط§ظ… ط±ظ…ط² ط§ظ„طھط­ظ‚ظ‚ ط§ظ„طھط§ظ„ظٹ:</p>
                        <p dir="ltr" style="margin:5px 0 0;color:#64748b;font-size:13px;text-align:left;">Thank you for registering on Tabibi! Use the code below to verify your email address.</p>
                    </td>
                </tr>

                <!-- OTP BOX -->
                <tr>
                    <td style="padding:0 40px 30px;text-align:center;">
                        <div style="background-color:#f0f9ff;border:2px dashed #0ea5e9;border-radius:16px;padding:30px;margin:10px 0;">
                            <p style="margin:0 0 12px;font-size:14px;color:#64748b;font-weight:700;">ط±ظ…ط² ط§ظ„طھط­ظ‚ظ‚ (Code de vأ©rification)</p>
                            <h2 style="margin:0;font-size:48px;letter-spacing:14px;color:#0f172a;font-weight:900;font-family:monospace;">{$otpCode}</h2>
                        </div>
                    </td>
                </tr>

                <!-- NOTICE -->
                <tr>
                    <td style="padding:0 40px 40px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:15px;">
                            <tr>
                                <td style="color:#92400e;font-size:13px;line-height:1.6;">
                                    <strong>طھظ†ط¨ظٹظ‡:</strong> ظ‡ط°ط§ ط§ظ„ط±ظ…ط² طµط§ظ„ط­ ظ„ظ…ط¯ط© <strong>10 ط¯ظ‚ط§ط¦ظ‚</strong> ظپظ‚ط·. ط¥ط°ط§ ظ„ظ… طھط·ظ„ط¨ ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨طŒ ظٹط±ط¬ظ‰ طھط¬ط§ظ‡ظ„ ظ‡ط°ظ‡ ط§ظ„ط±ط³ط§ظ„ط©.
                                    <br><br>
                                    <span style="font-size:12px;" dir="ltr"><strong>Note:</strong> This code expires in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                    <td style="background-color:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;color:#94a3b8;font-size:12px;">آ© {$year} Tabibi - ط·ط¨ظٹط¨ظٹ. ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ‚ ظ…ط­ظپظˆط¸ط©.</p>
                        <p style="margin:5px 0 0;color:#cbd5e1;font-size:11px;">ظ‡ط°ط§ ط§ظ„ط¨ط±ظٹط¯ ط¥ظ„ظƒطھط±ظˆظ†ظٹ طھظ„ظ‚ط§ط¦ظٹطŒ ظٹط±ط¬ظ‰ ط¹ط¯ظ… ط§ظ„ط±ط¯.</p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
HTML;
    }

    // ----------------------------------------------------------
    // ظ‚ط§ظ„ط¨ HTML ظ„ط±ط³ط§ظ„ط© ظ‚ط¨ظˆظ„ ط§ظ„ط­ط³ط§ط¨ ظˆط¥ط±ط³ط§ظ„ ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¯ط®ظˆظ„
    // ----------------------------------------------------------
    private static function buildApprovalCredentialsTemplate(
        string $toName,
        string $accountType,
        string $username,
        string $toEmail,
        ?string $plainPassword = null
    ): string {
        $year       = date('Y');
        $typeTitle  = ($accountType === 'clinic') ? 'ط¹ظٹط§ط¯ط© (Clinique)' : 'ط·ط¨ظٹط¨ (Mأ©decin)';
        $typeAr     = ($accountType === 'clinic') ? 'ط¹ظٹط§ط¯طھظƒظ…' : 'ط­ط³ط§ط¨ظƒظ… ظƒط·ط¨ظٹط¨';
        $loginUrl   = (defined('FRONTEND_URL') ? rtrim(FRONTEND_URL, '/') : 'http://localhost:80') . '/#/login';
        // PHASE 02B : Si $plainPassword est null (hash Bcrypt), afficher un message appropriأ©
        $plainPasswordDisplay = $plainPassword ?: 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„طھظٹ ط§ط®طھط±طھظ‡ط§ ط¹ظ†ط¯ ط§ظ„طھط³ط¬ظٹظ„';

        return <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, Tahoma, sans-serif; }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Tajawal',Arial,sans-serif;">
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr>
        <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">

                <!-- HEADER -->
                <tr>
                    <td style="background:linear-gradient(135deg,#0369a1,#0891b2,#06b6d4);padding:45px 40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:36px;font-weight:900;letter-spacing:1px;">ط·ط¨ظٹط¨ظٹ <span style="font-size:20px;font-weight:400;opacity:0.8;">Tabibi</span></h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">طµط­طھظƒظ…طŒ ط£ظˆظ„ظˆظٹطھظ†ط§</p>
                    </td>
                </tr>

                <!-- SUCCESS BADGE -->
                <tr>
                    <td align="center" style="padding:0 40px;">
                        <div style="display:inline-block;background-color:#ffffff;padding:12px 30px;border-radius:50px;margin-top:-30px;box-shadow:0 10px 25px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding-right:10px;color:#059669;font-size:16px;font-weight:700;">âœ… طھظ… ظ‚ط¨ظˆظ„ ط·ظ„ط¨ ط§ظ„ط§ظ†ط¶ظ…ط§ظ… ط¨ظ†ط¬ط§ط­</td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>

                <!-- GREETING -->
                <tr>
                    <td style="padding:40px 40px 15px;text-align:right;">
                        <p style="margin:0;color:#1e293b;font-size:20px;font-weight:700;">ظ…ط±ط­ط¨ط§ظ‹ {$toName}طŒ</p>
                        <p style="margin:10px 0 0;color:#64748b;font-size:14px;line-height:1.7;">
                            ظٹط³ط±ظ†ط§ ط¥ط¨ظ„ط§ط؛ظƒ ط¨ط£ظ†ظ‡ طھظ…طھ ظ…ط±ط§ط¬ط¹ط© ظˆط§ظ„ظ…ظˆط§ظپظ‚ط© ط¹ظ„ظ‰ ط·ظ„ط¨ ط§ظ†ط¶ظ…ط§ظ… <strong>{$typeAr}</strong> ط¥ظ„ظ‰ ظ…ظ†طµط© ط·ط¨ظٹط¨ظٹ ط¨ظ†ط¬ط§ط­!
                            ظٹظ…ظƒظ†ظƒ ط§ظ„ط¢ظ† طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ط¥ظ„ظ‰ ط­ط³ط§ط¨ظƒ ظˆط§ظ„ط¨ط¯ط، ظپظٹ طھظ‚ط¯ظٹظ… ط®ط¯ظ…ط§طھظƒ ظˆط¥ط¯ط§ط±ط© ظ…ظˆط§ط¹ظٹط¯ظƒ.
                        </p>
                        <p dir="ltr" style="margin:8px 0 0;color:#64748b;font-size:13px;text-align:left;line-height:1.5;">
                            Nous sommes ravis de vous informer que votre demande d'adhأ©sion a أ©tأ© approuvأ©e avec succأ¨s. Vous pouvez dأ¨s أ  prأ©sent vous connecter أ  votre compte :
                        </p>
                    </td>
                </tr>

                <!-- CREDENTIALS BOX -->
                <tr>
                    <td style="padding:10px 40px 25px;">
                        <div style="background-color:#f8fafc;border:2px solid #e2e8f0;border-radius:20px;padding:24px;">
                            <div style="text-align:center;margin-bottom:18px;">
                                <span style="display:inline-block;background-color:#e0f2fe;color:#0369a1;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;">
                                    ًں”‘ ط¨ظٹط§ظ†ط§طھ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ (Identifiants de connexion)
                                </span>
                            </div>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <!-- Type -->
                                <tr>
                                    <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;width:40%;">
                                                ظ†ظˆط¹ ط§ظ„ط­ط³ط§ط¨ <span style="font-size:11px;color:#94a3b8;">(Type)</span>:
                                            </td>
                                            <td align="left" style="color:#0f172a;font-size:14px;font-weight:800;">
                                                {$typeTitle}
                                            </td>
                                        </tr></table>
                                    </td>
                                </tr>

                                <!-- Email -->
                                <tr>
                                    <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;width:40%;">
                                                ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ <span style="font-size:11px;color:#94a3b8;">(Email)</span>:
                                            </td>
                                            <td align="left" style="color:#0369a1;font-size:14px;font-weight:800;font-family:monospace;" dir="ltr">
                                                {$toEmail}
                                            </td>
                                        </tr></table>
                                    </td>
                                </tr>

                                <!-- Username -->
                                <tr>
                                    <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;width:40%;">
                                                ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ… <span style="font-size:11px;color:#94a3b8;">(Username)</span>:
                                            </td>
                                            <td align="left" style="color:#0f172a;font-size:15px;font-weight:800;font-family:monospace;" dir="ltr">
                                                {$username}
                                            </td>
                                        </tr></table>
                                    </td>
                                </tr>

                                <!-- Password -->
                                <tr>
                                    <td style="padding:12px 0 0;">
                                        <table width="100%"><tr>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;width:40%;">
                                                ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± <span style="font-size:11px;color:#94a3b8;">(Mot de passe)</span>:
                                            </td>
                                            <td align="left">
                                                <span style="display:inline-block;background-color:#dcfce7;color:#15803d;padding:6px 14px;border-radius:8px;font-size:15px;font-weight:900;font-family:monospace;letter-spacing:1px;" dir="ltr">
                                                    {$plainPasswordDisplay}
                                                </span>
                                            </td>
                                        </tr></table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>

                <!-- CTA BUTTON -->
                <tr>
                    <td align="center" style="padding:0 40px 30px;">
                        <a href="{$loginUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#0369a1,#0891b2);color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:14px;font-size:16px;font-weight:800;box-shadow:0 4px 15px rgba(3,105,161,0.3);">
                            ًںڑ€ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ط§ظ„ط¢ظ† (Se connecter)
                        </a>
                    </td>
                </tr>

                <!-- SECURITY NOTICE -->
                <tr>
                    <td style="padding:0 40px 35px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:15px;">
                            <tr>
                                <td style="color:#92400e;font-size:13px;line-height:1.6;">
                                    <strong>ًں’، ظ†طµظٹط­ط© ط£ظ…ظ†ظٹط©:</strong> ظٹظڈط±ط¬ظ‰ ط§ظ„ط­ظپط§ط¸ ط¹ظ„ظ‰ ط³ط±ظٹط© ط¨ظٹط§ظ†ط§طھ ط­ط³ط§ط¨ظƒ ظˆط¹ط¯ظ… ظ…ط´ط§ط±ظƒطھظ‡ط§ ظ…ط¹ ط£ظٹ ط´ط®طµ. ظƒظ…ط§ ظٹظ…ظƒظ†ظƒ طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظپظٹ ط£ظٹ ظˆظ‚طھ ط¨ط¹ط¯ ط§ظ„ط¯ط®ظˆظ„ ظ…ظ† ط®ظ„ط§ظ„ طµظپط­ط© ط§ظ„ظ…ظ„ظپ ط§ظ„ط´ط®طµظٹ.
                                    <br><br>
                                    <span style="font-size:12px;" dir="ltr"><strong>Conseil de sأ©curitأ© :</strong> Veuillez garder vos identifiants confidentiels. Vous pouvez modifier votre mot de passe أ  tout moment depuis votre profil.</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                    <td style="background-color:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;color:#94a3b8;font-size:12px;">آ© {$year} Tabibi - ط·ط¨ظٹط¨ظٹ. ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ‚ ظ…ط­ظپظˆط¸ط©.</p>
                        <p style="margin:5px 0 0;color:#cbd5e1;font-size:11px;">ظ‡ط°ط§ ط§ظ„ط¨ط±ظٹط¯ ط¥ظ„ظƒطھط±ظˆظ†ظٹ طھظ„ظ‚ط§ط¦ظٹطŒ ظٹط±ط¬ظ‰ ط¹ط¯ظ… ط§ظ„ط±ط¯.</p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
HTML;
    }

    private static function buildPasswordResetTemplate(string $toName, string $otpCode): string {
        $year = date('Y');
        return <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, Tahoma, sans-serif; }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Tajawal',Arial,sans-serif;">
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr>
        <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
                
                <!-- HEADER -->
                <tr>
                    <td style="background:linear-gradient(135deg,#0369a1,#0891b2,#06b6d4);padding:45px 40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:36px;font-weight:900;letter-spacing:1px;">ط·ط¨ظٹط¨ظٹ <span style="font-size:20px;font-weight:400;opacity:0.8;">Tabibi</span></h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">طµط­طھظƒظ…طŒ ط£ظˆظ„ظˆظٹطھظ†ط§</p>
                    </td>
                </tr>

                <!-- SUCCESS BADGE -->
                <tr>
                    <td align="center" style="padding:0 40px;">
                        <div style="display:inline-block;background-color:#ffffff;padding:12px 30px;border-radius:50px;margin-top:-30px;box-shadow:0 10px 25px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding-right:10px;color:#0ea5e9;font-size:16px;font-weight:700;">ًں”گ ط¥ط¹ط§ط¯ط© طھط¹ظٹظٹظ† ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±</td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>

                <!-- GREETING -->
                <tr>
                    <td style="padding:40px 40px 20px;text-align:right;">
                        <p style="margin:0;color:#1e293b;font-size:20px;font-weight:700;">ظ…ط±ط­ط¨ط§ظ‹ {$toName}طŒ</p>
                        <p style="margin:10px 0 0;color:#64748b;font-size:14px;line-height:1.6;">ظ„ظ‚ط¯ طھظ„ظ‚ظٹظ†ط§ ط·ظ„ط¨ط§ظ‹ ظ„ط¥ط¹ط§ط¯ط© طھط¹ظٹظٹظ† ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط®ط§طµط© ط¨ط­ط³ط§ط¨ظƒ ظپظٹ ظ…ظ†طµط© ط·ط¨ظٹط¨ظٹ. ط§ط³طھط®ط¯ظ… ط§ظ„ط±ظ…ط² ط§ظ„ط³ط±ظٹ ط£ط¯ظ†ط§ظ‡ ظ„ط¥ظƒظ…ط§ظ„ ط§ظ„ط¹ظ…ظ„ظٹط©:</p>
                        <p dir="ltr" style="margin:5px 0 0;color:#64748b;font-size:13px;text-align:left;">Nous avons reأ§u une demande de rأ©initialisation de votre mot de passe. Utilisez le code ci-dessous :</p>
                    </td>
                </tr>

                <!-- OTP BOX -->
                <tr>
                    <td style="padding:0 40px 30px;text-align:center;">
                        <div style="background-color:#f8fafc;border:2px dashed #0ea5e9;border-radius:16px;padding:25px;margin:10px 0;">
                            <p style="margin:0;font-size:14px;color:#64748b;font-weight:700;margin-bottom:10px;">ط±ظ…ط² ط§ظ„طھط­ظ‚ظ‚ (Code de vأ©rification)</p>
                            <h2 style="margin:0;font-size:42px;letter-spacing:10px;color:#0f172a;font-weight:900;font-family:monospace;">{$otpCode}</h2>
                        </div>
                    </td>
                </tr>

                <!-- NOTICE -->
                <tr>
                    <td style="padding:0 40px 40px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:15px;">
                            <tr>
                                <td style="color:#92400e;font-size:13px;line-height:1.4;">
                                    <strong>طھظ†ط¨ظٹظ‡:</strong> ظ‡ط°ط§ ط§ظ„ط±ظ…ط² طµط§ظ„ط­ ظ„ظ…ط¯ط© <strong>15 ط¯ظ‚ظٹظ‚ط©</strong> ظپظ‚ط·. ط¥ط°ط§ ظ„ظ… طھط·ظ„ط¨ طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±طŒ ظٹط±ط¬ظ‰ طھط¬ط§ظ‡ظ„ ظ‡ط°ظ‡ ط§ظ„ط±ط³ط§ظ„ط©.
                                    <br><br>
                                    <span style="font-size:12px;" dir="ltr"><strong>Note:</strong> Ce code expire dans <strong>15 minutes</strong>. Si vous n'avez pas fait cette demande, ignorez ce message.</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                    <td style="background-color:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;color:#94a3b8;font-size:12px;">آ© {$year} Tabibi - ط·ط¨ظٹط¨ظٹ. ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ‚ ظ…ط­ظپظˆط¸ط©.</p>
                        <p style="margin:5px 0 0;color:#cbd5e1;font-size:11px;">ظ‡ط°ط§ ط§ظ„ط¨ط±ظٹط¯ ط¥ظ„ظƒطھط±ظˆظ†ظٹ طھظ„ظ‚ط§ط¦ظٹطŒ ظٹط±ط¬ظ‰ ط¹ط¯ظ… ط§ظ„ط±ط¯.</p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
HTML;
    }

    private static function buildConfirmationTemplate(
        string $toName,
        string $doctorname,
        string $clinicname,
        string $appointmentDate
    ): string {
        $dateFmt = date('d/m/Y', strtotime($appointmentDate));
        $timeFmt = date('H:i',   strtotime($appointmentDate));
        $year    = date('Y');

        return <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, Tahoma, sans-serif; }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Tahoma,sans-serif;">
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr>
        <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">

                <!-- HEADER -->
                <tr>
                    <td style="background:linear-gradient(135deg,#0369a1,#0891b2,#06b6d4);padding:45px 40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:36px;font-weight:900;letter-spacing:1px;">&#1591;&#1576;&#1610;&#1576;&#1610; <span style="font-size:20px;font-weight:400;opacity:0.8;">Tabibi</span></h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">&#1589;&#1581;&#1578;&#1603;&#1605;&#1548; &#1571;&#1608;&#1604;&#1608;&#1610;&#1578;&#1606;&#1575;</p>
                    </td>
                </tr>

                <!-- SUCCESS BADGE -->
                <tr>
                    <td align="center" style="padding:0 40px;">
                        <div style="display:inline-block;background-color:#ffffff;padding:12px 30px;border-radius:50px;margin-top:-30px;box-shadow:0 10px 25px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">
                            <span style="color:#059669;font-size:16px;font-weight:700;">&#10003; &#1578;&#1605; &#1578;&#1571;&#1603;&#1610;&#1583; &#1575;&#1604;&#1605;&#1608;&#1593;&#1583; &#1576;&#1606;&#1580;&#1575;&#1581;</span>
                        </div>
                    </td>
                </tr>

                <!-- GREETING -->
                <tr>
                    <td style="padding:40px 40px 20px;text-align:right;">
                        <p style="margin:0;color:#1e293b;font-size:20px;font-weight:700;">&#1605;&#1585;&#1581;&#1576;&#1575;&#1611; {$toName}&#1548;</p>
                        <p style="margin:10px 0 0;color:#64748b;font-size:14px;line-height:1.6;">&#1587;&#1593;&#1583;&#1575;&#1569; &#1576;&#1573;&#1576;&#1604;&#1575;&#1594;&#1603; &#1571;&#1606;&#1607; &#1578;&#1605; &#1578;&#1571;&#1603;&#1610;&#1583; &#1605;&#1608;&#1593;&#1583;&#1603; &#1575;&#1604;&#1591;&#1576;&#1610;. &#1573;&#1604;&#1610;&#1603; &#1578;&#1601;&#1575;&#1589;&#1610;&#1604; &#1575;&#1604;&#1605;&#1608;&#1593;&#1583;:</p>
                    </td>
                </tr>

                <!-- DETAILS -->
                <tr>
                    <td style="padding:0 40px 30px;">
                        <div style="background-color:#f8fafc;border:2px solid #f1f5f9;border-radius:20px;padding:25px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <!-- Mأ©decin -->
                                <tr>
                                    <td style="padding-bottom:15px;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;width:40%;">
                                                &#1575;&#1604;&#1591;&#1576;&#1610;&#1576; <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Mأ©decin)</span>:
                                            </td>
                                            <td align="left" style="color:#0f172a;font-size:15px;font-weight:900;">{$doctorname}</td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <!-- Clinique -->
                                <tr>
                                    <td style="padding:15px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;width:40%;">
                                                &#1575;&#1604;&#1593;&#1610;&#1575;&#1583;&#1577; <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Clinique)</span>:
                                            </td>
                                            <td align="left" style="color:#0f172a;font-size:15px;font-weight:900;">{$clinicname}</td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <!-- Patient -->
                                <tr>
                                    <td style="padding:15px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;width:40%;">
                                                &#1575;&#1604;&#1605;&#1585;&#1610;&#1590; <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Patient)</span>:
                                            </td>
                                            <td align="left" style="color:#0f172a;font-size:15px;font-weight:900;">{$toName}</td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <!-- Date -->
                                <tr>
                                    <td style="padding:15px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;width:40%;">
                                                &#1575;&#1604;&#1578;&#1575;&#1585;&#1610;&#1582; <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Date)</span>:
                                            </td>
                                            <td align="left" style="color:#0369a1;font-size:15px;font-weight:900;">{$dateFmt}</td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <!-- Heure -->
                                <tr>
                                    <td style="padding:15px 0 0;">
                                        <table width="100%"><tr>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;width:40%;">
                                                &#1575;&#1604;&#1608;&#1602;&#1578; <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Heure)</span>:
                                            </td>
                                            <td align="left" style="color:#0369a1;font-size:15px;font-weight:900;">{$timeFmt}</td>
                                        </tr></table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>

                <!-- NOTICE -->
                <tr>
                    <td style="padding:0 40px 40px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:15px;">
                            <tr>
                                <td style="color:#92400e;font-size:13px;line-height:1.4;"><strong>&#1578;&#1606;&#1576;&#1610;&#1607;:</strong> &#1610;&#1585;&#1580;&#1609; &#1575;&#1604;&#1581;&#1590;&#1608;&#1585; &#1602;&#1576;&#1604; &#1575;&#1604;&#1605;&#1608;&#1593;&#1583; &#1576;&#1600; 15 &#1583;&#1602;&#1610;&#1602;&#1577;. &#1601;&#1610; &#1581;&#1575;&#1604; &#1578;&#1593;&#1584;&#1585; &#1575;&#1604;&#1581;&#1590;&#1608;&#1585;&#1548; &#1610;&#1585;&#1580;&#1609; &#1575;&#1604;&#1573;&#1604;&#1594;&#1575;&#1569; &#1593;&#1576;&#1585; &#1575;&#1604;&#1578;&#1591;&#1576;&#1610;&#1602;.</td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                    <td style="background-color:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;color:#94a3b8;font-size:12px;">آ© {$year} Tabibi - &#1591;&#1576;&#1610;&#1576;&#1610;. &#1580;&#1605;&#1610;&#1593; &#1575;&#1604;&#1581;&#1602;&#1608;&#1602; &#1605;&#1581;&#1601;&#1608;&#1592;&#1577;.</p>
                        <p style="margin:5px 0 0;color:#cbd5e1;font-size:11px;">&#1607;&#1584;&#1575; &#1575;&#1604;&#1576;&#1585;&#1610;&#1583; &#1573;&#1604;&#1603;&#1578;&#1585;&#1608;&#1606;&#1610; &#1578;&#1604;&#1602;&#1575;&#1574;&#1610;&#1548; &#1610;&#1585;&#1580;&#1609; &#1593;&#1583;&#1605; &#1575;&#1604;&#1585;&#1583;.</p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
HTML;
    }



    private static function buildCancellationTemplate(string $toName, string $appointmentDate): string {
        $dateFmt = date('d/m/Y \أ  H:i', strtotime($appointmentDate));
        $year    = date('Y');
        return <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#fef2f2;font-family:Arial,sans-serif;">
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:40px 0;">
    <tr>
        <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
                <tr>
                    <td style="background-color:#dc2626;padding:40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:28px;">ط¥ظ„ط؛ط§ط، ظ…ظˆط¹ط¯ - Tabibi</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding:40px;text-align:right;">
                        <p style="font-size:18px;color:#1e293b;">ظ…ط±ط­ط¨ط§ظ‹ {$toName}طŒ</p>
                        <p style="color:#64748b;line-height:1.6;">ظ†ط­ظٹط·ظƒظ… ط¹ظ„ظ…ط§ظ‹ ط¨ط£ظ†ظ‡ ظ‚ط¯ طھظ… ط¥ظ„ط؛ط§ط، ظ…ظˆط¹ط¯ظƒظ… ط§ظ„ظ…ظ‚ط±ط± ط¨طھط§ط±ظٹط® <strong>{$dateFmt}</strong>.</p>
                        <p style="margin-top:20px;color:#64748b;">ظٹظ…ظƒظ†ظƒظ… ط­ط¬ط² ظ…ظˆط¹ط¯ ط¬ط¯ظٹط¯ ط¹ط¨ط± ط§ظ„طھط·ط¨ظٹظ‚ ظپظٹ ط£ظٹ ظˆظ‚طھ.</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color:#f8fafc;padding:20px;text-align:center;">
                        <p style="color:#94a3b8;font-size:12px;">آ© {$year} Tabibi</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
HTML;
    }
}
