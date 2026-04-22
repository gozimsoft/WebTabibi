import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Mail, Phone, MapPin, Info } from "lucide-react";
import { Btn, Card, Input } from "../components/SharedUI";

// ── Responsive Hook (Local Copy) ──
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

export default function ContactPage({ navigate }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [sent, setSent] = useState(false);
  const [loading, setL] = useState(false);

  const submit = e => {
    e.preventDefault();
    setL(true);
    setTimeout(() => { setL(false); setSent(true); }, 1500);
  };

  if (sent) return (
    <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: 24 }}>
      <div style={{ width: 80, height: 80, background: "#f0fdf4", color: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <CheckCircle size={48} />
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0c4a6e", marginBottom: 16 }}>{t("contact_success_title")}</h1>
      <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 32, lineHeight: 1.6 }}>
        {t("contact_success_desc")}
      </p>
      <Btn onClick={() => navigate("/")}>{t("back_to_home")}</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px 16px" : "28px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0c4a6e", marginBottom: 12 }}>{t("contact_title")}</h1>
        <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 550, margin: "0 auto" }}>
          {t("contact_subtitle")}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", gap: isMobile ? 24 : 32 }}>
        <Card style={{ padding: 32 }}>
          <form onSubmit={submit}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Input label={t("fullname")} placeholder={t("fullname_placeholder")} required />
              <Input label={t("specialty")} placeholder={t("specialty_placeholder")} required />
            </div>
            <Input label={t("clinic_name_label")} placeholder={t("clinic_name_placeholder")} />
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Input label={t("phone")} placeholder={t("phone_placeholder")} required />
              <Input label={t("email")} type="email" placeholder={t("email_placeholder")} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{t("message_label")}</label>
              <textarea placeholder={t("message_placeholder")} required style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid var(--border)", minHeight: 120, fontSize: 14 }} />
            </div>
            <Btn type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", padding: 14 }}>{t("send_message_btn")}</Btn>
          </form>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { icon: <Mail color="var(--brand)" />, title: t("email_label"), content: "contact@stellarsoft.dz" },
            { icon: <Phone color="var(--brand)" />, title: t("phone_label"), content: "0657111543 / 0660333343" },
            { icon: <MapPin color="var(--brand)" />, title: t("address_label"), content: t("address_content") }
          ].map((item, i) => (
            <Card key={i} style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, background: "var(--brand-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 15, color: "#0c4a6e", fontWeight: 800 }}>{item.content}</div>
              </div>
            </Card>
          ))}
          <div style={{ marginTop: 10, padding: 20, background: "#fff7ed", borderRadius: 16, border: "1px solid #fed7aa" }}>
            <h4 style={{ margin: "0 0 8px", color: "#9a3412", display: "flex", alignItems: "center", gap: 8 }}><Info size={18} /> {t("note_title")}</h4>
            <p style={{ margin: 0, fontSize: 13, color: "#9a3412", lineHeight: 1.6 }}>
              {t("note_desc")}
            </p>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Btn variant="secondary" onClick={() => navigate("/")}>{t("back_to_home")}</Btn>
      </div>
    </div>
  );
}
