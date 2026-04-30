<?php
// ============================================================
// helpers/EmailHelper.php  — SMTP natif (sans PHPMailer)
// ============================================================
require_once __DIR__ . '/../config/database.php';

class EmailHelper {

    /**
     * Envoie un email via SMTP (Gmail) sans dépendance externe.
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
            error_log("[Tabibi Email] Cannot connect to {$host}:{$port} — {$errstr}");
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
        string $appointmentDate,
        string $reason
    ): bool {
        $subject = 'تأكيد موعدك | Confirmation de rendez-vous - Tabibi';
        $html    = self::buildConfirmationTemplate($toName, $doctorname, $clinicname, $appointmentDate, $reason);
        $text    = "مرحباً {$toName}، تم تأكيد موعدك مع {$doctorname} في {$clinicname} بتاريخ {$appointmentDate}. السبب: {$reason}.";
        return self::sendSmtp($toEmail, $toName, $subject, $html, $text);
    }

    public static function sendAppointmentCancellation(
        string $toEmail,
        string $toName,
        string $appointmentDate
    ): bool {
        $subject = 'إلغاء موعدك | Annulation - Tabibi';
        $html    = self::buildCancellationTemplate($toName, $appointmentDate);
        $text    = "مرحباً {$toName}، تم إلغاء موعدك بتاريخ {$appointmentDate}.";
        return self::sendSmtp($toEmail, $toName, $subject, $html, $text);
    }

    private static function buildConfirmationTemplate(
        string $toName,
        string $doctorname,
        string $clinicname,
        string $appointmentDate,
        string $reason
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
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
        body { font-family: 'Tajawal', Arial, sans-serif; }
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
                        <h1 style="margin:0;color:#ffffff;font-size:36px;font-weight:900;letter-spacing:1px;">طبيبي <span style="font-size:20px;font-weight:400;opacity:0.8;">Tabibi</span></h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">صحتكم، أولويتنا</p>
                    </td>
                </tr>

                <!-- SUCCESS BADGE -->
                <tr>
                    <td align="center" style="padding:0 40px;">
                        <div style="display:inline-block;background-color:#ffffff;padding:12px 30px;border-radius:50px;margin-top:-30px;box-shadow:0 10px 25px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td><img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" width="24" height="24" style="display:block;"></td>
                                    <td style="padding-right:10px;color:#059669;font-size:16px;font-weight:700;">تم تأكيد الموعد بنجاح</td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>

                <!-- GREETING -->
                <tr>
                    <td style="padding:40px 40px 20px;text-align:right;">
                        <p style="margin:0;color:#1e293b;font-size:20px;font-weight:700;">مرحباً {$toName}،</p>
                        <p style="margin:10px 0 0;color:#64748b;font-size:14px;line-height:1.6;">سعداء بإبلاغك أنه تم تأكيد موعدك الطبي. إليك كافة التفاصيل التي تحتاجها:</p>
                    </td>
                </tr>

                <!-- DETAILS -->
                <tr>
                    <td style="padding:0 40px 30px;">
                        <div style="background-color:#f8fafc;border:2px solid #f1f5f9;border-radius:20px;padding:25px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <!-- Médecin -->
                                <tr>
                                    <td style="padding-bottom:15px;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="width:30px;"><img src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" width="20"></td>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;">
                                                الطبيب <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Médecin / Doctor)</span>:
                                            </td>
                                            <td align="left" style="color:#0f172a;font-size:15px;font-weight:900;">{$doctorname}</td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <!-- Spécialité -->
                                <tr>
                                    <td style="padding:15px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="width:30px;"><img src="https://cdn-icons-png.flaticon.com/512/3063/3063203.png" width="20"></td>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;">
                                                التخصص <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Spécialité / Specialty)</span>:
                                            </td>
                                            <td align="left" style="color:#0f172a;font-size:15px;font-weight:900;">Cardiologie</td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <!-- Patient -->
                                <tr>
                                    <td style="padding:15px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="width:30px;"><img src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png" width="20"></td>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;">
                                                المريض <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Patient)</span>:
                                            </td>
                                            <td align="left" style="color:#0f172a;font-size:15px;font-weight:900;">{$toName}</td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <!-- Motif -->
                                <tr>
                                    <td style="padding:15px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="width:30px;"><img src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png" width="20"></td>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;">
                                                سبب الزيارة <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Motif / Reason)</span>:
                                            </td>
                                            <td align="left" style="color:#0f172a;font-size:15px;font-weight:900;">{$reason}</td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <!-- Date -->
                                <tr>
                                    <td style="padding:15px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="width:30px;"><img src="https://cdn-icons-png.flaticon.com/512/3652/3652191.png" width="20"></td>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;">
                                                التاريخ <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Date)</span>:
                                            </td>
                                            <td align="left" style="color:#0369a1;font-size:15px;font-weight:900;">{$dateFmt}</td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <!-- Heure -->
                                <tr>
                                    <td style="padding:15px 0;border-bottom:1px solid #e2e8f0;">
                                        <table width="100%"><tr>
                                            <td style="width:30px;"><img src="https://cdn-icons-png.flaticon.com/512/2972/2972531.png" width="20"></td>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;">
                                                الوقت <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Heure / Time)</span>:
                                            </td>
                                            <td align="left" style="color:#0369a1;font-size:15px;font-weight:900;">{$timeFmt}</td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <!-- Frais -->
                                <tr>
                                    <td style="padding:15px 0 0;">
                                        <table width="100%"><tr>
                                            <td style="width:30px;"><img src="https://cdn-icons-png.flaticon.com/512/2489/2489756.png" width="20"></td>
                                            <td style="color:#64748b;font-size:13px;font-weight:700;">
                                                رسوم الاستشارة <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-right:5px;">(Frais / Fees)</span>:
                                            </td>
                                            <td align="left" style="color:#059669;font-size:15px;font-weight:900;">1000 DA</td>
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
                                <td style="color:#92400e;font-size:13px;line-height:1.4;"><strong>تنبيه:</strong> يرجى الحضور قبل الموعد بـ 15 دقيقة لإتمام الإجراءات الإدارية. في حال تعذر الحضور، يرجى الإلغاء عبر التطبيق.</td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                    <td style="background-color:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;color:#94a3b8;font-size:12px;">© {$year} Tabibi - طبيبي. جميع الحقوق محفوظة.</p>
                        <p style="margin:5px 0 0;color:#cbd5e1;font-size:11px;">هذا البريد إلكتروني تلقائي، يرجى عدم الرد.</p>
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
        $dateFmt = date('d/m/Y \à H:i', strtotime($appointmentDate));
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
                        <h1 style="margin:0;color:#ffffff;font-size:28px;">إلغاء موعد - Tabibi</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding:40px;text-align:right;">
                        <p style="font-size:18px;color:#1e293b;">مرحباً {$toName}،</p>
                        <p style="color:#64748b;line-height:1.6;">نحيطكم علماً بأنه قد تم إلغاء موعدكم المقرر بتاريخ <strong>{$dateFmt}</strong>.</p>
                        <p style="margin-top:20px;color:#64748b;">يمكنكم حجز موعد جديد عبر التطبيق في أي وقت.</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color:#f8fafc;padding:20px;text-align:center;">
                        <p style="color:#94a3b8;font-size:12px;">© {$year} Tabibi</p>
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
