// src/components/PasswordStrengthMeter.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Check, ShieldAlert, ShieldCheck } from "lucide-react";

/**
 * Evaluates password strength based on recommended security standards:
 * - Length: 8+ characters
 * - Uppercase: at least 1 letter (A-Z)
 * - Number: at least 1 digit (0-9)
 * - Special character: at least 1 symbol
 */
export function getPasswordCriteria(password = "") {
  const pwd = String(password || "");
  const hasMinLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  const passedCount = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  let score = 0; // 0 to 4
  let color = "#94a3b8";
  let labelKey = "pwd_strength_weak";

  if (!pwd) {
    score = 0;
    color = "#94a3b8";
    labelKey = "";
  } else if (passedCount <= 2) {
    score = 1;
    color = "#ef4444"; // Red
    labelKey = "pwd_strength_weak";
  } else if (passedCount === 3) {
    score = 2;
    color = "#f59e0b"; // Amber
    labelKey = "pwd_strength_medium";
  } else if (passedCount === 4) {
    if (pwd.length >= 12) {
      score = 4;
      color = "#059669"; // Deep emerald
      labelKey = "pwd_strength_very_strong";
    } else {
      score = 3;
      color = "#10b981"; // Green
      labelKey = "pwd_strength_strong";
    }
  }

  return {
    pwd,
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecial,
    passedCount,
    score,
    color,
    labelKey,
  };
}

export default function PasswordStrengthMeter({ password = "", showCriteria = true, alwaysShow = false, style = {} }) {
  const { t } = useTranslation();

  // If no password and not requested to show, don't render
  if (!password && !alwaysShow) return null;

  const {
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecial,
    score,
    color,
    labelKey,
  } = getPasswordCriteria(password);

  const criteria = [
    { key: "min_length", label: t("pwd_rule_min_length", "8 أحرف على الأقل"), passed: hasMinLength },
    { key: "uppercase", label: t("pwd_rule_uppercase", "حرف كبير واحد على الأقل (A-Z)"), passed: hasUppercase },
    { key: "number", label: t("pwd_rule_number", "رقم واحد على الأقل (0-9)"), passed: hasNumber },
    { key: "special", label: t("pwd_rule_special", "رمز خاص واحد على الأقل (@, #, $, ...)"), passed: hasSpecial },
  ];

  return (
    <div style={{ marginTop: 8, marginBottom: 14, ...style }}>
      {/* Gauge Header: Label + Strength Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 5 }}>
          {score >= 3 ? <ShieldCheck size={14} color={color} /> : <ShieldAlert size={14} color={color} />}
          <span>{t("pwd_strength_label", "قوة كلمة المرور")}:</span>
        </div>
        {labelKey ? (
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            padding: "2px 8px",
            borderRadius: 8,
            background: color + "18",
            color: color,
            border: `1px solid ${color}35`,
            transition: "all 0.3s ease"
          }}>
            {t(labelKey)}
          </span>
        ) : (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 8,
            background: "#f1f5f9",
            color: "#64748b",
            border: "1px solid #e2e8f0"
          }}>
            {t("pwd_strength_hint", "المعايير الموصى بها")}
          </span>
        )}
      </div>

      {/* 4 Segmented Progress Bars */}
      <div style={{ display: "flex", gap: 4, height: 6, marginBottom: 8 }}>
        {[1, 2, 3, 4].map(idx => {
          const isFilled =
            (score >= 3 && idx <= 3) ||
            (score === 4 && idx <= 4) ||
            (score === 2 && idx <= 2) ||
            (score === 1 && idx === 1);
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: 4,
                background: isFilled ? color : "#e2e8f0",
                transition: "background 0.3s ease"
              }}
            />
          );
        })}
      </div>

      {/* Criteria Checklist */}
      {showCriteria && (
        <div style={{
          background: "var(--bg, #f8fafc)",
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: 10,
          padding: "8px 12px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 6,
          fontSize: 11.5
        }}>
          {criteria.map(c => (
            <div
              key={c.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: c.passed ? "#15803d" : "#94a3b8",
                fontWeight: c.passed ? 700 : 500,
                transition: "color 0.2s ease"
              }}
            >
              <div style={{
                width: 15,
                height: 15,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: c.passed ? "#dcfce7" : "#f1f5f9",
                color: c.passed ? "#16a34a" : "#cbd5e1",
                flexShrink: 0
              }}>
                {c.passed ? <Check size={10} strokeWidth={3} /> : <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#cbd5e1" }} />}
              </div>
              <span style={{ lineHeight: 1.2 }}>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
