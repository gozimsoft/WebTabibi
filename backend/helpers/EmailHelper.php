<?php
// ============================================================
// helpers/EmailHelper.php
// ============================================================
require_once __DIR__ . '/../config/database.php';

class EmailHelper {

    /**
     * Send appointment confirmation email using PHP's built-in mail().
     * In production replace with PHPMailer / SMTP.
     */
    public static function sendAppointmentConfirmation(
        string $toEmail,
        string $toName,
        string $doctorName,
        string $clinicName,
        string $appointmentDate,
        string $reason
    ): bool {
        $subject  = "✅ Confirmation de Rendez-vous - Tabibi طبيبي";
        $dateFormatted = date('d/m/Y à H:i', strtotime($appointmentDate));

        $body = "
        <!DOCTYPE html>
        <html dir='rtl' lang='ar'>
        <head><meta charset='UTF-8'></head>
        <body style='font-family:Arial,sans-serif;background:#f4f7fb;padding:20px'>
          <div style='max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)'>
            <div style='background:linear-gradient(135deg,#0d6efd,#0096c7);padding:30px;text-align:center'>
              <h1 style='color:#fff;margin:0;font-size:28px'>طبيبي - Tabibi</h1>
              <p style='color:rgba(255,255,255,0.9);margin:8px 0 0'>نظام حجز المواعيد الطبية</p>
            </div>
            <div style='padding:30px'>
              <h2 style='color:#0d6efd;margin-top:0'>✅ تم تأكيد موعدك!</h2>
              <p style='color:#333;font-size:16px'>مرحباً <strong>{$toName}</strong>،</p>
              <p style='color:#555'>تم حجز موعدك بنجاح. إليك تفاصيل الموعد:</p>
              <div style='background:#f8f9fa;border-right:4px solid #0d6efd;border-radius:8px;padding:20px;margin:20px 0'>
                <table style='width:100%;border-collapse:collapse'>
                  <tr><td style='padding:8px 0;color:#666;width:40%'>👨‍⚕️ الطبيب:</td><td style='padding:8px 0;font-weight:bold;color:#333'>{$doctorName}</td></tr>
                  <tr><td style='padding:8px 0;color:#666'>🏥 العيادة:</td><td style='padding:8px 0;font-weight:bold;color:#333'>{$clinicName}</td></tr>
                  <tr><td style='padding:8px 0;color:#666'>📅 التاريخ والوقت:</td><td style='padding:8px 0;font-weight:bold;color:#0d6efd'>{$dateFormatted}</td></tr>
                  <tr><td style='padding:8px 0;color:#666'>🩺 سبب الزيارة:</td><td style='padding:8px 0;font-weight:bold;color:#333'>{$reason}</td></tr>
                </table>
              </div>
              <div style='background:#fff3cd;border-radius:8px;padding:15px;margin:20px 0'>
                <p style='margin:0;color:#856404;font-size:14px'>⚠️ يرجى الحضور قبل 10 دقائق من موعدك</p>
              </div>
              <p style='color:#555;font-size:14px'>إذا أردت إلغاء أو تعديل الموعد، يمكنك ذلك من خلال تطبيق طبيبي.</p>
            </div>
            <div style='background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #e9ecef'>
              <p style='margin:0;color:#6c757d;font-size:12px'>Tabibi © " . date('Y') . " — جميع الحقوق محفوظة</p>
            </div>
          </div>
        </body></html>";

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: " . MAIL_NAME . " <" . MAIL_USER . ">\r\n";
        $headers .= "Reply-To: " . MAIL_USER . "\r\n";

        // Try to send — returns false if mail() fails (common in dev environments)
        return @mail($toEmail, $subject, $body, $headers);
    }

    public static function sendAppointmentCancellation(
        string $toEmail,
        string $toName,
        string $appointmentDate
    ): bool {
        $subject = "❌ إلغاء الموعد - Tabibi";
        $dateFormatted = date('d/m/Y à H:i', strtotime($appointmentDate));

        $body = "
        <html><body style='font-family:Arial,sans-serif;padding:20px'>
        <h2 style='color:#dc3545'>تم إلغاء موعدك</h2>
        <p>مرحباً <strong>{$toName}</strong>،</p>
        <p>تم إلغاء موعدك المحدد بتاريخ <strong>{$dateFormatted}</strong>.</p>
        <p>يمكنك حجز موعد جديد في أي وقت عبر تطبيق طبيبي.</p>
        </body></html>";

        $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: ".MAIL_NAME." <".MAIL_USER.">\r\n";
        return @mail($toEmail, $subject, $body, $headers);
    }
}
