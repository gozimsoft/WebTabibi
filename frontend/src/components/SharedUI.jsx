import React, { useState, useCallback } from "react";

export const Spinner = ({ size = 24 }) => (
  <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
    <div style={{ width: size, height: size, border: `3px solid var(--brand-light)`, borderTopColor: "var(--brand)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
  </div>
);

export const Skeleton = ({ width, height, borderRadius = 12, style = {} }) => (
  <div style={{
    width: width || "100%",
    height: height || 20,
    borderRadius,
    background: "linear-gradient(90deg, var(--bg) 25%, var(--border) 50%, var(--bg) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite linear",
    ...style
  }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

export const CardSkeleton = () => (
  <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: 20, display: "flex", gap: 14 }}>
    <Skeleton width={50} height={50} borderRadius={12} />
    <div style={{ flex: 1 }}>
      <Skeleton width="60%" height={16} style={{ marginBottom: 10 }} />
      <Skeleton width="40%" height={12} />
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {Array(count).fill(0).map((_, i) => <CardSkeleton key={i} />)}
  </div>
);

export const DoctorDetailSkeleton = () => (
  <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
    <Skeleton width={120} height={20} style={{ marginBottom: 20 }} />
    <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: 28, marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 32, flexDirection: "row" }}>
        <Skeleton width={200} height={200} borderRadius={32} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <Skeleton width={80} height={24} borderRadius={20} />
            <Skeleton width={60} height={24} borderRadius={20} />
          </div>
          <Skeleton width="40%" height={32} style={{ marginBottom: 16 }} />
          <Skeleton width="30%" height={20} style={{ marginBottom: 12 }} />
          <Skeleton width="50%" height={20} style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <Skeleton width={100} height={15} />
            <Skeleton width={100} height={15} />
          </div>
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
      <Skeleton width={80} height={30} borderRadius={0} />
      <Skeleton width={80} height={30} borderRadius={0} />
      <Skeleton width={80} height={30} borderRadius={0} />
    </div>
    <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: 24 }}>
      <Skeleton width="100%" height={150} />
    </div>
  </div>
);

export const AppointmentSkeleton = () => (
  <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: 20, marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Skeleton width={48} height={48} borderRadius={10} />
        <div>
          <Skeleton width={120} height={16} style={{ marginBottom: 6 }} />
          <Skeleton width={80} height={12} />
        </div>
      </div>
      <Skeleton width={70} height={24} borderRadius={20} />
    </div>
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
      <Skeleton width={150} height={14} />
      <Skeleton width={100} height={14} />
    </div>
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

export const Stars = ({ rating = 0, interactive, onChange, size = 16, color = "#fbbf24" }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} onClick={() => interactive && onChange?.(i)}
        style={{
          fontSize: size,
          cursor: interactive ? "pointer" : "default",
          color: i <= rating ? color : "#e2e8f0",
          transition: "all 0.2s",
          textShadow: i <= rating ? `0 0 8px ${color}40` : "none"
        }}>★</span>
    ))}
  </div>
);

export const VerifiedBadge = ({ size = 16 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", color: "#3b82f6", background: "#eff6ff", borderRadius: 20, padding: "2px 8px", gap: 4, fontSize: 11, fontWeight: 700, border: "1px solid #dbeafe" }}>
    <ShieldCheck size={size} /> {localStorage.getItem("tabibi_lang") === "ar" ? "موثق" : "Vérifié"}
  </div>
);

export const AvailabilityPulse = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#059669", fontWeight: 700 }}>
    <div style={{ position: "relative", width: 8, height: 8 }}>
      <div style={{ position: "absolute", width: "100%", height: "100%", background: "#10b981", borderRadius: "50%" }} />
      <div style={{
        position: "absolute", width: "100%", height: "100%", background: "#10b981", borderRadius: "50%",
        animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
      }} />
    </div>
    <style>{`
      @keyframes ping {
        75%, 100% { transform: scale(2.5); opacity: 0; }
      }
    `}</style>
    {localStorage.getItem("tabibi_lang") === "ar" ? "متاح اليوم" : "Disponible"}
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

export const Badge = ({ children, color = "var(--brand)" }) => (
  <span style={{ background: color + "15", color, border: `1px solid ${color}30`, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{children}</span>
);

export const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 24,
    cursor: onClick ? "pointer" : "default", ...style
  }}>{children}</div>
);

export const Input = ({ label, error, ...p }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</label>}
    <input {...p} style={{
      width: "100%", padding: "10px 14px", border: `1.5px solid ${error ? "#f87171" : "var(--border)"}`,
      borderRadius: 10, fontSize: 14, outline: "none", background: "#fafafa",
      boxSizing: "border-box", transition: "border 0.2s", ...p.style
    }}
      onFocus={e => e.target.style.borderColor = "var(--brand)"}
      onBlur={e => e.target.style.borderColor = error ? "#f87171" : "var(--border)"}
    />
    {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠ {error}</div>}
  </div>
);

export const Btn = ({ children, variant = "primary", style = {}, loading: ld, disabled, ...p }) => {
  const variants = {
    primary: { background: "linear-gradient(135deg,var(--brand),var(--brand-dark))", color: "#fff", boxShadow: "0 4px 12px rgba(8,145,178,0.25)" },
    secondary: { background: "#f3f4f6", color: "#374151", border: "1px solid var(--border)" },
    danger: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" },
    ghost: { background: "transparent", color: "var(--brand)", border: "1px solid var(--brand)" },
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
