import React, { useState, useCallback } from "react";

export const Spinner = ({ size = 24 }) => (
  <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
    <div style={{ width: size, height: size, border: `3px solid #e2f4f4`, borderTopColor: "#0891b2", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
  </div>
);

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }, []);
  const Toast = () => toast ? (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: toast.type === "error" ? "#fee2e2" : "#d1fae5",
      color: toast.type === "error" ? "#991b1b" : "#065f46",
      border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#6ee7b7"}`,
      borderRadius: 12, padding: "12px 20px", fontWeight: 600, fontSize: 14,
      boxShadow: "0 8px 30px rgba(0,0,0,0.15)", display: "flex", gap: 12, alignItems: "center", maxWidth: 380
    }}>
      <span style={{ fontSize: 20 }}>{toast.type === "error" ? "❌" : "✅"}</span>
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, color: "inherit" }}>×</button>
    </div>
  ) : null;
  return { show, Toast };
}

export const Stars = ({ rating = 0, interactive, onChange, size = 18 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} onClick={() => interactive && onChange?.(i)}
        style={{ fontSize: size, cursor: interactive ? "pointer" : "default", color: i <= rating ? "#f59e0b" : "#d1d5db", transition: "color 0.1s" }}>★</span>
    ))}
  </div>
);

export const DoctorImage = ({ photo, size = 50, borderRadius = 12, style = {} }) => {
  if (photo) {
    return (
      <img
        src={`data:image/jpeg;base64,${photo}`}
        alt="Doctor"
        style={{ width: size, height: size, borderRadius, objectFit: "cover", flexShrink: 0, ...style }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius,
      background: "linear-gradient(135deg,#ecfeff,#cffafe)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45, flexShrink: 0, ...style
    }}>👨‍⚕️</div>
  );
};

export const Badge = ({ children, color = "#0891b2" }) => (
  <span style={{ background: color + "15", color, border: `1px solid ${color}30`, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{children}</span>
);

export const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 24,
    cursor: onClick ? "pointer" : "default", ...style
  }}>{children}</div>
);

export const Input = ({ label, error, ...p }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</label>}
    <input {...p} style={{
      width: "100%", padding: "10px 14px", border: `1.5px solid ${error ? "#f87171" : "#e5e7eb"}`,
      borderRadius: 10, fontSize: 14, outline: "none", background: "#fafafa",
      boxSizing: "border-box", transition: "border 0.2s", ...p.style
    }}
      onFocus={e => e.target.style.borderColor = "#0891b2"}
      onBlur={e => e.target.style.borderColor = error ? "#f87171" : "#e5e7eb"}
    />
    {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠ {error}</div>}
  </div>
);

export const Btn = ({ children, variant = "primary", style = {}, loading: ld, disabled, ...p }) => {
  const variants = {
    primary: { background: "linear-gradient(135deg,#0891b2,#0e7490)", color: "#fff", boxShadow: "0 4px 12px rgba(8,145,178,0.25)" },
    secondary: { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" },
    danger: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" },
    ghost: { background: "transparent", color: "#0891b2", border: "1px solid #0891b2" },
    success: { background: "linear-gradient(135deg,#059669,#047857)", color: "#fff" },
  };
  return (
    <button {...p} disabled={ld || disabled} style={{
      padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none",
      cursor: (ld || disabled) ? "not-allowed" : "pointer", transition: "all 0.2s",
      display: "inline-flex", alignItems: "center", gap: 8, opacity: (ld || disabled) ? 0.7 : 1,
      ...variants[variant], ...style
    }}>
      {ld && <Spinner size={14} />}{children}
    </button>
  );
};
