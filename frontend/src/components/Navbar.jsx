// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Btn } from "./SharedUI";
import analytics from "../utils/analytics";
import { api } from "../api/client";

const ANIM_KEYS = ["right", "left", "flip", "pulse", "bounce"];

const ANIM_MAP = {
  right: "nb-rot-r 1s ease-in-out",
  left: "nb-rot-l 1s ease-in-out",
  flip: "nb-flip-y 1s ease-in-out",
  pulse: "nb-pulse 1s ease-in-out",
  bounce: "nb-bounce 1s ease-in-out",
};

export default function Navbar({ user, navigate, onLogout }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [animKey, setAnimKey] = useState(null); // null = no animation
  const [textAnim, setTextAnim] = useState({});
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const name = user?.profile?.fullname?.split(" ")[0] || user?.username || "U";

  useEffect(() => {
    let timeoutId;
    const trigger = () => {
      const randomKey = ANIM_KEYS[Math.floor(Math.random() * ANIM_KEYS.length)];

      // Step 1 — reset to null so React sees a real change
      setAnimKey(null);

      // Step 2 — apply new animation after 50ms
      setTimeout(() => setAnimKey(randomKey), 50);

      // Step 3 — clear after animation ends
      setTimeout(() => setAnimKey(null), 1150);

      // Step 4 — schedule next trigger
      const nextDelay = Math.floor(Math.random() * (30000 - 5000 + 1)) + 5000;
      timeoutId = setTimeout(trigger, nextDelay);
    };

    timeoutId = setTimeout(trigger, 800);
    return () => clearTimeout(timeoutId);
  }, []);

  // جلب التنبيهات من الخادم
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.notifications.list();
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // تحديث تلقائي كل 15 ثانية لجلب التنبيهات الجديدة
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // إغلاق القوائم المنسدلة عند الضغط خارجها
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    if (open || notifOpen) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("touchstart", onClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, [open, notifOpen]);

  const toggleNotifications = () => {
    setNotifOpen(!notifOpen);
    setOpen(false); // إغلاق قائمة الملف الشخصي عند فتح التنبيهات
  };

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation(); // منع استدعاء markAsRead
    try {
      await api.notifications.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navItems = [
    [t("search"), "/search", "🔍"],
    [t("my_appointments"), "/appointments", "📅"],
    [t("messages"), "/chat", "💬"],
  ];

  return (
    <nav style={{
      background: "#fff", borderBottom: "1px solid #e5e7eb",
      padding: "0 24px", height: 64, display: "flex",
      alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 500, boxShadow: "0 1px 8px rgba(0,0,0,0.06)"
    }}>
      <style>{`
     
        @keyframes nb-flip-y {
          0%   { transform: rotateY(0deg);              }
          50%  { transform: rotateY(180deg) scale(1.2); }
          100% { transform: rotateY(360deg);            }
        }
    
        @keyframes nb-flip-v {
          0%   { transform: scaleY(1);  color: #0e7490; }
          50%  { transform: scaleY(-1); color: #0891b2; }
          100% { transform: scaleY(1);  color: #0e7490; }
        }
      `}</style>

      {/* logo */}
      <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>

        {/* ✅ key forces React to remount the div — animation always retriggers */}
        <div
          key={animKey ?? "idle"}
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,146,162,0.15)",
            animation: animKey ? ANIM_MAP[animKey] : "none",
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}logo.png?v=10`}
            alt="logo"
            style={{ width: 30, height: 30, objectFit: "contain" }}
          />
        </div>

        <div style={{ perspective: "400px" }}>
          <div
            onMouseEnter={() => setTextAnim({ animation: "nb-flip-v 0.5s ease-in-out" })}
            onMouseLeave={() => setTimeout(() => setTextAnim({}), 500)}
            style={{
              fontWeight: 900, fontSize: 18, color: "#0e7490", lineHeight: 1.1,
              display: "inline-block",
              ...textAnim
            }}
          >
            {t("app_name")}
          </div>
          <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase" }}>Tabibi</div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <LanguageSwitcher />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {navItems.map(([l, p, ic]) => (
            <button key={p} onClick={() => navigate(p)} style={{
              background: "none", border: "none", cursor: "pointer", padding: "8px 12px",
              borderRadius: 8, color: "#374151", fontWeight: 600, fontSize: 13, transition: "all 0.15s",
              display: (!user && p !== "/search") ? "none" : "block"
            }}
              onMouseEnter={e => e.target.style.background = "#f3f4f6"}
              onMouseLeave={e => e.target.style.background = "none"}>
              <span style={{ marginLeft: i18n.language === 'ar' ? 4 : 0, marginRight: i18n.language !== 'ar' ? 4 : 0 }}>{ic}</span>
              {l}
            </button>
          ))}
        </div>

        {user && (
          <div ref={notifRef} style={{ position: "relative" }}>
            <button onClick={toggleNotifications} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 38, height: 38, borderRadius: "50%",
              background: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer",
              position: "relative", transition: "background 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#e5e7eb"}
              onMouseLeave={e => e.currentTarget.style.background = "#f3f4f6"}>
              <span style={{ fontSize: 18 }}>🔔</span>
              {unreadCount > 0 && (
                <div style={{
                  position: "absolute", top: -2, right: -2,
                  background: "#ef4444", color: "#fff",
                  fontSize: 10, fontWeight: 700,
                  minWidth: 16, height: 16, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 4px", border: "2px solid #fff"
                }}>
                  {unreadCount}
                </div>
              )}
            </button>
            {notifOpen && (
              <div style={{
                position: "absolute",
                right: i18n.language === 'ar' ? 'auto' : 0,
                left: i18n.language === 'ar' ? 0 : 'auto',
                top: 46, background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                width: 320, maxHeight: 400, overflow: "hidden", zIndex: 600,
                display: "flex", flexDirection: "column"
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", borderBottom: "1px solid #f3f4f6",
                  background: "#f9fafb"
                }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                    {t("notifications", "التنبيهات")}
                  </span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} style={{
                      background: "none", border: "none", color: "#0891b2",
                      fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0
                    }}
                      onMouseEnter={e => e.target.style.textDecoration = "underline"}
                      onMouseLeave={e => e.target.style.textDecoration = "none"}>
                      {t("mark_all_read", "تحديد الكل كمقروء")}
                    </button>
                  )}
                </div>
                {/* List */}
                <div style={{ overflowY: "auto", flex: 1, maxHeight: 340 }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280", fontSize: 13 }}>
                      {t("no_notifications", "لا توجد تنبيهات جديدة")}
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={() => { markAsRead(n.id, n.is_read); }} style={{
                        padding: "12px 16px", borderBottom: "1px solid #f3f4f6",
                        cursor: "pointer", transition: "background 0.15s",
                        background: n.is_read ? "#fff" : "#f0f9ff",
                        display: "flex", gap: 10, position: "relative",
                        borderLeft: (!n.is_read && i18n.language !== 'ar') ? "3px solid #0891b2" : "none",
                        borderRight: (!n.is_read && i18n.language === 'ar') ? "3px solid #0891b2" : "none"
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = n.is_read ? "#f9fafb" : "#e0f2fe"}
                        onMouseLeave={e => e.currentTarget.style.background = n.is_read ? "#fff" : "#f0f9ff"}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: n.is_read ? "#4b5563" : "#111827" }}>
                              {n.title}
                            </span>
                            <span style={{ fontSize: 9, color: "#9ca3af" }}>
                              {formatDate(n.created_at)}
                            </span>
                          </div>
                          <p style={{
                            margin: 0, fontSize: 12, color: "#4b5563",
                            lineHeight: 1.4, whiteSpace: "pre-line",
                            textAlign: i18n.language === 'ar' ? 'right' : 'left'
                          }}>
                            {n.message}
                          </p>
                        </div>
                        <button onClick={(e) => deleteNotification(e, n.id)} style={{
                          background: "none", border: "none", color: "#9ca3af",
                          cursor: "pointer", fontSize: 12, padding: "2px 4px",
                          alignSelf: "flex-start", borderRadius: 4, transition: "all 0.2s"
                        }}
                          onMouseEnter={e => { e.target.style.color = "#ef4444"; e.target.style.background = "#fef2f2"; }}
                          onMouseLeave={e => { e.target.style.color = "#9ca3af"; e.target.style.background = "none"; }}>
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {user ? (
          <div ref={menuRef} style={{ position: "relative" }}>
            <button onClick={() => setOpen(!open)} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
              border: "1px solid #6ee7b7", borderRadius: 30, padding: "6px 14px 6px 8px", cursor: "pointer"
            }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0891b2,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                {name[0].toUpperCase()}
              </div>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#065f46" }}>{name}</span>
              <span style={{ fontSize: 9, color: "#065f46" }}>▼</span>
            </button>
            {open && (
              <div style={{ position: "absolute", right: i18n.language === 'ar' ? 0 : 'auto', left: i18n.language === 'ar' ? 'auto' : 0, top: 46, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", minWidth: 180, overflow: "hidden", zIndex: 600 }}>
                {[
                  ["👤", t("profile"), "/profile"],
                  ["📅", t("my_appointments"), "/appointments"],
                  ["💬", t("messages"), "/chat"],
                ].map(([ic, lb, pt]) => (
                  <button key={pt} onClick={() => { navigate(pt); setOpen(false); }} style={{
                    width: "100%", padding: "11px 16px", background: "none", border: "none",
                    cursor: "pointer", textAlign: i18n.language === 'ar' ? "right" : "left",
                    display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151", transition: "background 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <span>{ic}</span><span style={{ fontWeight: 600 }}>{lb}</span>
                  </button>
                ))}
                <div style={{ borderTop: "1px solid #f3f4f6" }} />
                <button onClick={() => { onLogout(); setOpen(false); }} style={{
                  width: "100%", padding: "11px 16px", background: "none", border: "none",
                  cursor: "pointer", textAlign: i18n.language === 'ar' ? "right" : "left",
                  display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#dc2626"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <span>🚪</span><span style={{ fontWeight: 600 }}>{t("logout")}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={() => navigate("/login")} style={{ padding: "8px 18px" }}>{t("login")}</Btn>
            <Btn variant="primary" onClick={() => navigate("/register")} style={{ padding: "8px 18px" }}>{t("register")}</Btn>
          </div>
        )}
      </div>
    </nav>
  );
}
