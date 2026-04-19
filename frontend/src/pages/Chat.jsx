// src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { Btn, Spinner, DoctorImage } from "../components/SharedUI";

export default function ChatPage({ user }) {
  const { t, i18n } = useTranslation();
  const [threads, setThreads] = useState([]);
  const [sel, setSel] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [loading, setL] = useState(true);
  const [msgL, setML] = useState(false);
  const [txt, setTxt] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    api.chat.threads().then(setThreads).catch(() => { }).finally(() => setL(false));
  }, []);

  useEffect(() => {
    if (!sel) return;
    setML(true);
    api.chat.messages(sel.ID).then(setMsgs).catch(() => { }).finally(() => setML(false));
  }, [sel]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async e => {
    e.preventDefault();
    if (!txt.trim() || !sel) return;
    const m = { ID: Date.now(), SenderID: user.id, Content: txt, CreatedAt: new Date().toISOString() };
    setMsgs(p => [...p, m]); setTxt("");
    try { await api.chat.send(sel.ID, { content: txt }); } catch { }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", background: "#fff" }}>
      {/* Threads list */}
      <div style={{ width: 320, borderLeft: i18n.language === 'ar' ? "1px solid #e5e7eb" : "none", borderRight: i18n.language !== 'ar' ? "1px solid #e5e7eb" : "none", display: "flex", flexDirection: "column", background: "#f9fafb" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0c4a6e", margin: 0 }}>{t("messages")}</h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {threads.map(tr => (
            <div key={tr.ID} onClick={() => setSel(tr)} style={{
              padding: "16px", borderBottom: "1px solid #f3f4f6", cursor: "pointer",
              background: sel?.ID === tr.ID ? "#ecfeff" : "none", display: "flex", gap: 12, alignItems: "center"
            }}>
              <DoctorImage photo={tr.DoctorPhoto} size={44} borderRadius="50%" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#374151" }}>{tr.DoctorName}</div>
                <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tr.LastMessage || t("no_messages")}</div>
              </div>
            </div>
          ))}
          {threads.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>{t("no_chats")}</div>}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {sel ? (
          <>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12 }}>
              <DoctorImage photo={sel.DoctorPhoto} size={38} borderRadius="50%" />
              <div style={{ fontWeight: 800, color: "#0c4a6e" }}>{sel.DoctorName}</div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#fff", display: "flex", flexDirection: "column", gap: 12 }}>
              {msgL ? <Spinner /> : msgs.map(m => {
                const isMe = m.SenderID === user.id;
                return (
                  <div key={m.ID} style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    maxWidth: "70%", padding: "10px 14px", borderRadius: 16,
                    background: isMe ? "#0891b2" : "#f3f4f6",
                    color: isMe ? "#fff" : "#374151",
                    fontSize: 14, boxShadow: isMe ? "0 2px 8px rgba(8,145,178,0.2)" : "none",
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: isMe ? 16 : 4
                  }}>
                    <div>{m.Content}</div>
                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: "left" }}>
                      {new Date(m.CreatedAt).toLocaleTimeString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language, { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} style={{ padding: 16, borderTop: "1px solid #e5e7eb", display: "flex", gap: 10 }}>
              <input value={txt} onChange={e => setTxt(e.target.value)} placeholder={t("type_message")} style={{ flex: 1, padding: "12px 16px", border: "1.5px solid #e5e7eb", borderRadius: 12, outline: "none", fontSize: 14 }} />
              <Btn type="submit" disabled={!txt.trim()} style={{ padding: "12px 24px" }}>{t("send")}</Btn>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 60 }}>💬</div>
            <div style={{ fontSize: 14 }}>{t("select_chat")}</div>
          </div>
        )}
      </div>
    </div>
  );
}
