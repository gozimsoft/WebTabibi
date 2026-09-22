import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, ChevronLeft, ChevronRight, Eye, EyeOff, HelpCircle } from "lucide-react";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

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
  <div style={{ background: "var(--card-bg)", borderRadius: 16, padding: 20, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <Skeleton width={56} height={56} borderRadius={28} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width="60%" height={18} />
        <Skeleton width="40%" height={14} />
      </div>
    </div>
    <Skeleton width="100%" height={36} borderRadius={8} />
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const DoctorDetailSkeleton = () => (
  <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ background: "var(--card-bg)", borderRadius: 20, padding: 24, border: "1px solid var(--border)", display: "flex", gap: 20, alignItems: "center" }}>
      <Skeleton width={90} height={90} borderRadius={45} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <Skeleton width="50%" height={24} />
        <Skeleton width="30%" height={16} />
        <Skeleton width="40%" height={14} />
      </div>
    </div>
    <div style={{ background: "var(--card-bg)", borderRadius: 20, padding: 24, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 14 }}>
      <Skeleton width="35%" height={20} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height={42} borderRadius={10} />
        ))}
      </div>
    </div>
  </div>
);

export const AppointmentSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} style={{ background: "var(--card-bg)", borderRadius: 16, padding: 18, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton width={140} height={16} />
            <Skeleton width={90} height={12} />
          </div>
        </div>
        <Skeleton width={80} height={32} borderRadius={8} />
      </div>
    ))}
  </div>
);

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }, []);
  const Toast = () => {
    if (!toast || typeof document === "undefined") return null;
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    return createPortal(
      <div style={{
        position: "fixed",
        top: isMobile ? 72 : 88,
        right: isMobile ? 16 : 24,
        left: isMobile ? 16 : "auto",
        zIndex: 9999999,
        background: toast.type === "error" ? "#fee2e2" : "#d1fae5",
        color: toast.type === "error" ? "#991b1b" : "#065f46",
        border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#6ee7b7"}`,
        borderRadius: 14,
        padding: "14px 20px",
        fontWeight: 600,
        fontSize: 14,
        boxShadow: "0 14px 35px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.08)",
        display: "flex",
        gap: 12,
        alignItems: "center",
        maxWidth: isMobile ? "calc(100vw - 32px)" : 420,
        pointerEvents: "auto",
        animation: "fadeIn 0.2s ease-out"
      }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{toast.type === "error" ? "❌" : "✅"}</span>
        <span style={{ flex: 1, wordBreak: "break-word", lineHeight: 1.4 }}>{toast.msg}</span>
        <button
          type="button"
          onClick={() => setToast(null)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 22, lineHeight: 1, color: "inherit", opacity: 0.7,
            padding: "0 4px", display: "flex", alignItems: "center"
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
        >
          ×
        </button>
      </div>,
      document.body
    );
  };
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
    <ShieldCheck size={size} /> {(localStorage.getItem("i18nextLng")?.startsWith("ar") ? "ar" : "fr") === "ar" ? "موثق" : "Vérifié"}
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
    {(localStorage.getItem("i18nextLng")?.startsWith("ar") ? "ar" : "fr") === "ar" ? "متاح اليوم" : "Disponible"}
  </div>
);

import defaultAvatar from "../../assets/Avatar.png";
export const DoctorImage = ({ photo, name, size = 50, borderRadius = 12, style = {}, fallbackIcon: FallbackIcon }) => {
  if (photo) {
    return (
      <img
        src={`data:image/jpeg;base64,${photo}`}
        alt="Doctor"
        style={{ width: size, height: size, borderRadius, objectFit: "cover", flexShrink: 0, ...style }}
      />
    );
  }

  if (FallbackIcon) {
    return (
      <div style={{
        width: size, height: size, borderRadius,
        background: "linear-gradient(135deg,#ecfeff,#cffafe)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, ...style
      }}>
        <FallbackIcon size={size * 0.5} color="var(--brand)" />
      </div>
    );
  }

  return (
    <img
      src={defaultAvatar}
      alt="Doctor Avatar"
      style={{ width: size, height: size, borderRadius, objectFit: "cover", flexShrink: 0, ...style }}
    />
  );
};

export const Badge = ({ children, color = "var(--brand)", style = {} }) => (
  <span style={{ display: "inline-block", background: color + "15", color, border: `1px solid ${color}30`, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600, ...style }}>{children}</span>
);

export const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: "#fff", borderRadius: 16, border: "1px solid #0891b2",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 24,
    cursor: onClick ? "pointer" : "default", ...style
  }}>{children}</div>
);

export const Input = ({ label, error, tooltip, helpText, ...p }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</label>
        {tooltip && (
          <span
            title={tooltip}
            aria-label={tooltip}
            style={{
              cursor: "help", color: "#0891b2", display: "inline-flex", alignItems: "center",
              background: "#ecfeff", borderRadius: "50%", padding: 2
            }}
          >
            <HelpCircle size={13} />
          </span>
        )}
      </div>
    )}
    <input {...p} style={{
      width: "100%", padding: "10px 14px", border: `1.5px solid ${error ? "#f87171" : "var(--border)"}`,
      borderRadius: 10, fontSize: 14, outline: "none", background: "#fafafa",
      boxSizing: "border-box", transition: "border 0.2s", ...p.style
    }}
      onFocus={e => e.target.style.borderColor = "var(--brand)"}
      onBlur={e => e.target.style.borderColor = error ? "#f87171" : "var(--border)"}
    />
    {helpText && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{helpText}</div>}
    {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠ {error}</div>}
  </div>
);

export const PasswordInput = ({ label, error, showStrength = false, ...p }) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isMeterVisible = showStrength && (focused || Boolean(p.value));

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input
          {...p}
          type={show ? "text" : "password"}
          style={{
            width: "100%", padding: "10px 14px", paddingInlineEnd: 42,
            border: `1.5px solid ${error ? "#f87171" : "var(--border)"}`,
            borderRadius: 10, fontSize: 14, outline: "none", background: "#fafafa",
            boxSizing: "border-box", transition: "border 0.2s", ...p.style
          }}
          onFocus={e => {
            setFocused(true);
            e.target.style.borderColor = "var(--brand)";
            if (p.onFocus) p.onFocus(e);
          }}
          onBlur={e => {
            setFocused(false);
            e.target.style.borderColor = error ? "#f87171" : "var(--border)";
            if (p.onBlur) p.onBlur(e);
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            insetInlineEnd: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            borderRadius: 6
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {isMeterVisible && <PasswordStrengthMeter password={p.value || ""} alwaysShow={focused} />}
      {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠ {error}</div>}
    </div>
  );
};

export const Btn = ({ children, variant = "primary", style = {}, loading: ld, disabled, ...p }) => {
  const variants = {
    primary: { background: "linear-gradient(135deg,var(--brand),var(--brand-dark))", color: "#fff", boxShadow: "0 4px 12px rgba(8,145,178,0.25)" },
    secondary: { background: "#f3f4f6", color: "#374151", border: "1px solid #0891b2" },
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

export function SmartPaginationBar({
  page,
  setPage,
  limit,
  setLimit,
  totalItems,
  totalPages,
  limitOptions = [10, 20, 50, 100],
  isRtl = false,
  t = (k, def) => def
}) {
  if (totalItems <= 0) return null;
  const from = Math.min(((page - 1) * limit) + 1, totalItems);
  const to = Math.min(page * limit, totalItems);

  return (
    <div className="no-print" style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 12, marginTop: 16, padding: "12px 18px",
      background: "var(--card-bg, #ffffff)", borderRadius: 16,
      border: "1px solid var(--border, #e2e8f0)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
    }}>
      {/* Range and Limit info */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
          {t("admin_pagination_range", {
            from,
            to,
            total: totalItems,
            defaultValue: `Affichage de ${from} à ${to} sur un total de ${totalItems} enregistrements`
          })}
        </div>

        {setLimit && limitOptions && limitOptions.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", fontWeight: 700 }}>
            <span>{t("admin_pagination_per_page", "Par page")}:</span>
            <select
              value={limit}
              onChange={e => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{
                padding: "4px 8px", borderRadius: 8, border: "1px solid var(--border, #cbd5e1)",
                background: "var(--bg, #f8fafc)", fontSize: 12, fontWeight: 700, color: "#334155", outline: "none",
                cursor: "pointer"
              }}
            >
              {limitOptions.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Buttons */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={page <= 1}
            style={{
              padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
              background: "var(--bg, #f8fafc)", fontSize: 11, fontWeight: 800,
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.4 : 1, color: "#475569"
            }}
          >
            {t("admin_pagination_first", "Première")}
          </button>

          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
              background: "var(--bg, #f8fafc)", fontSize: 12, fontWeight: 800,
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.4 : 1, color: "#475569", display: "flex", alignItems: "center", gap: 4
            }}
          >
            {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />} {t("admin_pagination_prev", "Précédent")}
          </button>

          {/* Page Number Buttons Window */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
            .map((p, idx, arr) => {
              const prevP = arr[idx - 1];
              const showEllipsis = prevP && p - prevP > 1;
              const isActive = page === p;
              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span style={{ padding: "0 4px", color: "#94a3b8", fontSize: 12 }}>…</span>}
                  <button
                    type="button"
                    onClick={() => setPage(p)}
                    style={{
                      minWidth: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                      background: isActive ? "var(--brand, #0891b2)" : "var(--bg, #f8fafc)",
                      color: isActive ? "#ffffff" : "#334155",
                      fontWeight: 800, fontSize: 12,
                      boxShadow: isActive ? "0 2px 8px rgba(8,145,178,0.3)" : "none"
                    }}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{
              padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
              background: "var(--bg, #f8fafc)", fontSize: 12, fontWeight: 800,
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              opacity: page >= totalPages ? 0.4 : 1, color: "#475569", display: "flex", alignItems: "center", gap: 4
            }}
          >
            {t("admin_pagination_next", "Suivant")} {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            style={{
              padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border, #e2e8f0)",
              background: "var(--bg, #f8fafc)", fontSize: 11, fontWeight: 800,
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              opacity: page >= totalPages ? 0.4 : 1, color: "#475569"
            }}
          >
            {t("admin_pagination_last", "Dernière")}
          </button>
        </div>
      )}
    </div>
  );
}

