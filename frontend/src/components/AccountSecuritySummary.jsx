// src/components/AccountSecuritySummary.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck, ShieldAlert, Shield, AlertTriangle,
  CheckCircle, AlertCircle, Mail, Phone, Lock, Scale, ChevronRight, ChevronLeft, ArrowUpRight, X
} from "lucide-react";
import { Card, Badge, Btn } from "./SharedUI";

/**
 * Calculates security status and score based on verification, credentials, and legal consents.
 */
export function calculateSecurityScore({ form, verStatus, consentData }) {
  const emailVerified = Boolean(
    verStatus?.email_verified ||
    form?.emailvalidation == 1 ||
    form?.emailvalidation === true
  );

  const phoneVerified = Boolean(
    verStatus?.phone_verified ||
    form?.phonevalidation == 1 ||
    form?.phonevalidation === true ||
    (form?.phone && String(form.phone).trim().length >= 8)
  );

  const passwordSecure = true; // Bcrypt hashing enforced on server

  const consentsAccepted = Boolean(
    (form?.consent_cgu == 1 && form?.consent_privacy == 1) ||
    (consentData?.consents?.cgu?.value == 1 && consentData?.consents?.privacy?.value == 1)
  );

  const items = [
    { key: "email", valid: emailVerified },
    { key: "phone", valid: phoneVerified },
    { key: "password", valid: passwordSecure },
    { key: "consents", valid: consentsAccepted },
  ];

  const score = items.filter(i => i.valid).length;
  const total = items.length;
  const percentage = Math.round((score / total) * 100);

  let level = "weak";
  let color = "#dc2626";
  let bg = "#fef2f2";
  let border = "#fecaca";
  let Icon = AlertTriangle;

  if (score === 4) {
    level = "optimal";
    color = "#059669";
    bg = "#ecfdf5";
    border = "#a7f3d0";
    Icon = ShieldCheck;
  } else if (score === 3) {
    level = "good";
    color = "#0891b2";
    bg = "#f0f9ff";
    border = "#bae6fd";
    Icon = Shield;
  } else if (score === 2) {
    level = "medium";
    color = "#d97706";
    bg = "#fffbeb";
    border = "#fde68a";
    Icon = ShieldAlert;
  }

  return {
    score,
    total,
    percentage,
    level,
    color,
    bg,
    border,
    Icon,
    emailVerified,
    phoneVerified,
    passwordSecure,
    consentsAccepted
  };
}

/**
 * Compact Pill Badge for Profile Header with Toggle State
 */
export function AccountSecurityPill({ form, verStatus, consentData, onClick, isOpen = false, style = {} }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { score, total, level, color, bg, border, Icon } = calculateSecurityScore({ form, verStatus, consentData });

  const label = t(`security_score_${level}`);
  const titleText = isOpen
    ? t("security_summary_close", "Fermer le récapitulatif de sécurité")
    : t("security_summary_open", "Ouvrir le récapitulatif de sécurité");

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={titleText}
      aria-expanded={isOpen}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 12px",
        borderRadius: 24,
        background: isOpen ? (border || bg) : bg,
        border: `1.5px solid ${isOpen ? color : border}`,
        color: color,
        fontSize: 12,
        fontWeight: 700,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.18s ease-in-out",
        boxShadow: isOpen ? `0 0 0 2px ${border}` : "0 1px 3px rgba(0,0,0,0.04)",
        ...style
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = isOpen ? `0 0 0 2px ${border}` : "0 1px 3px rgba(0,0,0,0.04)";
        }
      }}
    >
      <Icon size={14} style={{ flexShrink: 0 }} />
      <span>{label}</span>
      <span style={{
        background: "rgba(255,255,255,0.85)",
        padding: "1px 6px",
        borderRadius: 10,
        fontSize: 10,
        fontWeight: 800,
        border: `1px solid ${border}`
      }}>
        {score}/{total}
      </span>
      {onClick && (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          transform: isOpen ? (isRtl ? "rotate(-90deg)" : "rotate(90deg)") : "none",
          transition: "transform 0.2s ease"
        }}>
          {isRtl ? <ChevronLeft size={12} style={{ opacity: 0.7 }} /> : <ChevronRight size={12} style={{ opacity: 0.7 }} />}
        </span>
      )}
    </div>
  );
}

/**
 * Detailed Account Security Card (Checklist & Score)
 */
export function AccountSecurityCard({
  form,
  verStatus,
  consentData,
  onVerifyEmail,
  onManagePhone,
  onManagePassword,
  onManageConsents,
  onClose,
  isMobile
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const {
    score, total, percentage, level, color, bg, border, Icon,
    emailVerified, phoneVerified, passwordSecure, consentsAccepted
  } = calculateSecurityScore({ form, verStatus, consentData });

  return (
    <Card style={{ marginBottom: 20, border: `1.5px solid ${border}`, background: "#ffffff", position: "relative" }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        paddingBottom: 16,
        borderBottom: "1px solid #f1f5f9"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: bg, border: `1.5px solid ${border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: color, flexShrink: 0
          }}>
            <Icon size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0c4a6e" }}>
                {t("security_summary_title", "Récapitulatif de sécurité du compte")}
              </h3>
              <span style={{
                background: bg, color: color, border: `1px solid ${border}`,
                padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 800
              }}>
                {t(`security_score_${level}`)} ({percentage}%)
              </span>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}>
              {t("security_summary_subtitle", "Indicateur global de protection et conformité")}
            </p>
          </div>
        </div>

        {/* Right side: Progress Bar & Optional Close Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: isRtl ? "left" : "right" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
              {t("security_criteria_count", { score, total })}
            </div>
            {/* Visual Mini Progress Bar */}
            <div style={{
              width: 120, height: 6, background: "#f1f5f9", borderRadius: 4,
              overflow: "hidden", marginTop: 6, display: "inline-block"
            }}>
              <div style={{
                width: `${percentage}%`, height: "100%", background: color,
                borderRadius: 4, transition: "width 0.4s ease-in-out"
              }} />
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title={t("close", "Fermer")}
              aria-label={t("close", "Fermer")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#64748b",
                cursor: "pointer",
                transition: "all 0.15s ease",
                flexShrink: 0
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#fee2e2";
                e.currentTarget.style.borderColor = "#fca5a5";
                e.currentTarget.style.color = "#dc2626";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 4 Security Pillars Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 12,
        marginTop: 16
      }}>
        {/* Pillar 1: Email */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", borderRadius: 12,
          background: emailVerified ? "rgba(5, 150, 105, 0.04)" : "rgba(239, 68, 68, 0.04)",
          border: `1px solid ${emailVerified ? "#d1fae5" : "#fee2e2"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {emailVerified ? (
              <CheckCircle size={18} color="#059669" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={13} color="#64748b" /> {t("security_item_email", "Adresse email")}
              </div>
              <div style={{
                fontSize: 11, color: emailVerified ? "#059669" : "#dc2626",
                marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {emailVerified ? t("security_item_email_verified") : t("security_item_email_unverified")}
              </div>
            </div>
          </div>
          {!emailVerified && onVerifyEmail && (
            <Btn
              variant="outline"
              onClick={onVerifyEmail}
              style={{
                fontSize: 11, padding: "4px 10px", borderColor: "#fca5a5", color: "#dc2626",
                whiteSpace: "nowrap", flexShrink: 0, [isRtl ? "marginRight" : "marginLeft"]: 8
              }}
            >
              {t("verify_email_btn", "Confirmer par OTP")}
            </Btn>
          )}
        </div>

        {/* Pillar 2: Phone */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", borderRadius: 12,
          background: phoneVerified ? "rgba(5, 150, 105, 0.04)" : "rgba(217, 119, 6, 0.04)",
          border: `1px solid ${phoneVerified ? "#d1fae5" : "#fef3c7"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {phoneVerified ? (
              <CheckCircle size={18} color="#059669" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={13} color="#64748b" /> {t("security_item_phone", "Numéro de téléphone")}
              </div>
              <div style={{
                fontSize: 11, color: phoneVerified ? "#059669" : "#d97706",
                marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {phoneVerified ? (form?.phone ? `${t("security_item_phone_verified")} (${form.phone})` : t("security_item_phone_verified")) : t("security_item_phone_unverified")}
              </div>
            </div>
          </div>
          {!phoneVerified && onManagePhone && (
            <Btn
              variant="outline"
              onClick={onManagePhone}
              style={{
                fontSize: 11, padding: "4px 10px", borderColor: "#fde68a", color: "#d97706",
                whiteSpace: "nowrap", flexShrink: 0, [isRtl ? "marginRight" : "marginLeft"]: 8
              }}
            >
              {t("manage_btn", "Gérer")}
            </Btn>
          )}
        </div>

        {/* Pillar 3: Password & Credentials */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", borderRadius: 12,
          background: "rgba(5, 150, 105, 0.04)",
          border: "1px solid #d1fae5",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <CheckCircle size={18} color="#059669" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                <Lock size={13} color="#64748b" /> {t("security_item_password", "Mot de passe & Identifiants")}
              </div>
              <div style={{ fontSize: 11, color: "#059669", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t("security_item_password_desc")}
              </div>
            </div>
          </div>
          {onManagePassword && (
            <Btn
              variant="ghost"
              onClick={onManagePassword}
              style={{
                fontSize: 11, padding: "4px 10px", color: "var(--brand, #0891b2)",
                whiteSpace: "nowrap", flexShrink: 0, [isRtl ? "marginRight" : "marginLeft"]: 8
              }}
            >
              {t("manage_btn", "Gérer")}
            </Btn>
          )}
        </div>

        {/* Pillar 4: Consents Loi 18-07 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", borderRadius: 12,
          background: consentsAccepted ? "rgba(5, 150, 105, 0.04)" : "rgba(217, 119, 6, 0.04)",
          border: `1px solid ${consentsAccepted ? "#d1fae5" : "#fef3c7"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {consentsAccepted ? (
              <CheckCircle size={18} color="#059669" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                <Scale size={13} color="#64748b" /> {t("security_item_consents", "Conformité Loi 18-07 & Confidentialité")}
              </div>
              <div style={{
                fontSize: 11, color: consentsAccepted ? "#059669" : "#d97706",
                marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {consentsAccepted ? t("security_item_consents_ok") : t("security_item_consents_pending")}
              </div>
            </div>
          </div>
          {onManageConsents && (
            <Btn
              variant="ghost"
              onClick={onManageConsents}
              style={{
                fontSize: 11, padding: "4px 10px", color: "var(--brand, #0891b2)",
                whiteSpace: "nowrap", flexShrink: 0, [isRtl ? "marginRight" : "marginLeft"]: 8
              }}
            >
              {consentsAccepted ? t("manage_btn", "Gérer") : t("regularize_btn", "Régulariser")}
            </Btn>
          )}
        </div>
      </div>
    </Card>
  );
}

export default AccountSecurityCard;
