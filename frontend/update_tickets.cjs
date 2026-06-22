const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'src', 'App.jsx');
let appCode = fs.readFileSync(appFile, 'utf8');

const replacements = [
  ['الرسائل والمحادثات', '{t("tickets_title")}'],
  ['محادثة مع الطبيب: ${t.doctorname}', '{t("ticket_with_doctor")} ${t.doctorname}'],
  ['محادثة مع العيادة: ${t.clinicname}', '{t("ticket_with_clinic")} ${t.clinicname}'],
  ['رسالة عامة', 't("ticket_general")'],
  ['من المريض: ${t.patientname}', '{t("ticket_from_patient")} ${t.patientname}'],
  ['آخر تحديث:', '{t("last_update")}'],
  ['مفتوحة', '{t("status_open")}'],
  ['بانتظار ردك', '{t("status_pending")}'],
  ['مغلقة', '{t("status_closed")}'],
  ['لا توجد رسائل حالياً', '{t("no_tickets")}'],
  ['العودة للرسائل', '{t("back_to_messages")}'],
  ['إنهاء المحادثة', '{t("end_conversation")}'],
  ['هل أنت متأكد من إغلاق هذه التذكرة؟', 't("confirm_close_ticket")'],
  ['تم إغلاق التذكرة', 't("ticket_closed_success")'],
  ['اكتب رسالتك هنا...', 't("write_message_here")'],
  ['الطبيب', "t('sender_doctor')"],
  ['العيادة', "t('sender_clinic')"],
  ['المريض', "t('sender_patient')"],
  ['هذه المحادثة مغلقة', '{t("conversation_closed")}'],
  ['إرسال رسالة جديدة', '{t("new_message_title")}'],
  ['عنوان الرسالة (الموضوع)', 't("message_subject")'],
  ['مثال: استفسار عن موعد', 't("subject_placeholder")'],
  ['محتوى الرسالة', '{t("message_content")}'],
  ['اكتب تفاصيل استفسارك هنا...', 't("message_content_placeholder")'],
  ['إرسال الآن', '{t("send_now")}'],
  ['تم إنشاء التذكرة بنجاح', 't("ticket_created_success")']
];

// More precise replacements for specific contexts
appCode = appCode.replace(/>الرسائل والمحادثات</g, '>{t("tickets_title")}<');
appCode = appCode.replace(/`محادثة مع الطبيب: \$\{t\.doctorname\}`/g, '`${t("ticket_with_doctor")} ${t.doctorname}`');
appCode = appCode.replace(/`محادثة مع العيادة: \$\{t\.clinicname\}`/g, '`${t("ticket_with_clinic")} ${t.clinicname}`');
appCode = appCode.replace(/"رسالة عامة"/g, 't("ticket_general")');
appCode = appCode.replace(/`من المريض: \$\{t\.patientname\}`/g, '`${t("ticket_from_patient")} ${t.patientname}`');
appCode = appCode.replace(/آخر تحديث: /g, '{t("last_update")} ');
appCode = appCode.replace(/"مفتوحة"/g, 't("status_open")');
appCode = appCode.replace(/"بانتظار ردك"/g, 't("status_pending")');
appCode = appCode.replace(/"مغلقة"/g, 't("status_closed")');
appCode = appCode.replace(/>لا توجد رسائل حالياً</g, '>{t("no_tickets")}<');
appCode = appCode.replace(/العودة للرسائل/g, '{t("back_to_messages")}');
appCode = appCode.replace(/>إنهاء المحادثة</g, '>{t("end_conversation")}<');
appCode = appCode.replace(/"هل أنت متأكد من إغلاق هذه التذكرة؟"/g, 't("confirm_close_ticket")');
appCode = appCode.replace(/"تم إغلاق التذكرة"/g, 't("ticket_closed_success")');
appCode = appCode.replace(/"اكتب رسالتك هنا..."/g, 't("write_message_here")');
// In the map function: m.sender_type === 'doctor' ? 'الطبيب' : m.sender_type === 'clinic' ? 'العيادة' : 'المريض'
appCode = appCode.replace(/'الطبيب'/g, 't("sender_doctor")');
appCode = appCode.replace(/'العيادة'/g, 't("sender_clinic")');
appCode = appCode.replace(/'المريض'/g, 't("sender_patient")');
appCode = appCode.replace(/>هذه المحادثة مغلقة</g, '>{t("conversation_closed")}<');
appCode = appCode.replace(/>إرسال رسالة جديدة</g, '>{t("new_message_title")}<');
appCode = appCode.replace(/label="عنوان الرسالة \(الموضوع\)"/g, 'label={t("message_subject")}');
appCode = appCode.replace(/placeholder="مثال: استفسار عن موعد"/g, 'placeholder={t("subject_placeholder")}');
appCode = appCode.replace(/>محتوى الرسالة</g, '>{t("message_content")}<');
appCode = appCode.replace(/placeholder="اكتب تفاصيل استفسارك هنا..."/g, 'placeholder={t("message_content_placeholder")}');
appCode = appCode.replace(/>إرسال الآن</g, '>{t("send_now")}<');
appCode = appCode.replace(/"تم إنشاء التذكرة بنجاح"/g, 't("ticket_created_success")');

// Need to ensure NewTicketPage uses t
appCode = appCode.replace(/function NewTicketPage\(\{ navigate, user, qs \}\) \{/g, 'function NewTicketPage({ navigate, user, qs }) {\n  const { t } = useTranslation();');

fs.writeFileSync(appFile, appCode, 'utf8');

// Update locales
const arFile = path.join(__dirname, 'src', 'locales', 'ar.json');
const frFile = path.join(__dirname, 'src', 'locales', 'fr.json');
const enFile = path.join(__dirname, 'src', 'locales', 'en.json');

const arData = JSON.parse(fs.readFileSync(arFile, 'utf8'));
const frData = JSON.parse(fs.readFileSync(frFile, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

const addAr = {
  "tickets_title": "الرسائل والمحادثات",
  "ticket_with_doctor": "محادثة مع الطبيب:",
  "ticket_with_clinic": "محادثة مع العيادة:",
  "ticket_general": "رسالة عامة",
  "ticket_from_patient": "من المريض:",
  "last_update": "آخر تحديث:",
  "status_open": "مفتوحة",
  "status_pending": "بانتظار ردك",
  "status_closed": "مغلقة",
  "no_tickets": "لا توجد رسائل حالياً",
  "back_to_messages": "العودة للرسائل",
  "end_conversation": "إنهاء المحادثة",
  "confirm_close_ticket": "هل أنت متأكد من إغلاق هذه التذكرة؟",
  "ticket_closed_success": "تم إغلاق التذكرة",
  "write_message_here": "اكتب رسالتك هنا...",
  "sender_doctor": "الطبيب",
  "sender_clinic": "العيادة",
  "sender_patient": "المريض",
  "conversation_closed": "هذه المحادثة مغلقة",
  "new_message_title": "إرسال رسالة جديدة",
  "message_subject": "عنوان الرسالة (الموضوع)",
  "subject_placeholder": "مثال: استفسار عن موعد",
  "message_content": "محتوى الرسالة",
  "message_content_placeholder": "اكتب تفاصيل استفسارك هنا...",
  "send_now": "إرسال الآن",
  "ticket_created_success": "تم إنشاء التذكرة بنجاح"
};

const addFr = {
  "tickets_title": "Messages et conversations",
  "ticket_with_doctor": "Conversation avec le médecin :",
  "ticket_with_clinic": "Conversation avec la clinique :",
  "ticket_general": "Message général",
  "ticket_from_patient": "Du patient :",
  "last_update": "Dernière mise à jour :",
  "status_open": "Ouverte",
  "status_pending": "En attente de réponse",
  "status_closed": "Fermée",
  "no_tickets": "Aucun message pour le moment",
  "back_to_messages": "Retour aux messages",
  "end_conversation": "Terminer la conversation",
  "confirm_close_ticket": "Voulez-vous vraiment fermer ce ticket ?",
  "ticket_closed_success": "Ticket fermé avec succès",
  "write_message_here": "Écrivez votre message ici...",
  "sender_doctor": "Médecin",
  "sender_clinic": "Clinique",
  "sender_patient": "Patient",
  "conversation_closed": "Cette conversation est fermée",
  "new_message_title": "Envoyer un nouveau message",
  "message_subject": "Sujet du message",
  "subject_placeholder": "Exemple : Demande de rendez-vous",
  "message_content": "Contenu du message",
  "message_content_placeholder": "Écrivez les détails de votre demande ici...",
  "send_now": "Envoyer maintenant",
  "ticket_created_success": "Message envoyé avec succès"
};

const addEn = {
  "tickets_title": "Messages and Conversations",
  "ticket_with_doctor": "Conversation with doctor:",
  "ticket_with_clinic": "Conversation with clinic:",
  "ticket_general": "General message",
  "ticket_from_patient": "From patient:",
  "last_update": "Last update:",
  "status_open": "Open",
  "status_pending": "Pending your reply",
  "status_closed": "Closed",
  "no_tickets": "No messages currently",
  "back_to_messages": "Back to messages",
  "end_conversation": "End conversation",
  "confirm_close_ticket": "Are you sure you want to close this ticket?",
  "ticket_closed_success": "Ticket closed successfully",
  "write_message_here": "Type your message here...",
  "sender_doctor": "Doctor",
  "sender_clinic": "Clinic",
  "sender_patient": "Patient",
  "conversation_closed": "This conversation is closed",
  "new_message_title": "Send a new message",
  "message_subject": "Message Subject",
  "subject_placeholder": "Example: Appointment inquiry",
  "message_content": "Message content",
  "message_content_placeholder": "Type your inquiry details here...",
  "send_now": "Send now",
  "ticket_created_success": "Ticket created successfully"
};

arData.translation = { ...arData.translation, ...addAr };
frData.translation = { ...frData.translation, ...addFr };
enData.translation = { ...enData.translation, ...addEn };

fs.writeFileSync(arFile, JSON.stringify(arData, null, 2), 'utf8');
fs.writeFileSync(frFile, JSON.stringify(frData, null, 2), 'utf8');
fs.writeFileSync(enFile, JSON.stringify(enData, null, 2), 'utf8');

console.log("Tickets page translations updated successfully.");
