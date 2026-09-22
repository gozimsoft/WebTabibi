// src/components/AvatarCropModal.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { X, ZoomIn, ZoomOut, RotateCw, RefreshCw, Check, Move } from "lucide-react";
import { Btn, Spinner } from "./SharedUI";

const VIEWPORT_SIZE = 300;
const OUTPUT_SIZE = 512;

export default function AvatarCropModal({ isOpen, imageSrc, onClose, onSave }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [saving, setSaving] = useState(false);

  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Reset when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setSaving(false);
    }
  }, [isOpen, imageSrc]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !saving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, saving, onClose]);

  const onImageLoad = (e) => {
    const nw = e.target.naturalWidth || 1;
    const nh = e.target.naturalHeight || 1;
    // Calculate cover dimensions for 300x300 viewport
    const coverScale = Math.max(VIEWPORT_SIZE / nw, VIEWPORT_SIZE / nh);
    setImgSize({
      naturalWidth: nw,
      naturalHeight: nh,
      width: nw * coverScale,
      height: nh * coverScale,
    });
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch drag handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 3.5));
  };

  // Global mouse up / touch end listener
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleConfirmCrop = async () => {
    if (!imgRef.current) return;
    setSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not initialize canvas context");

      // Fill background in case of transparent borders
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      const F = OUTPUT_SIZE / VIEWPORT_SIZE;

      // Center canvas
      ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
      // Pan offset
      ctx.translate(pan.x * F, pan.y * F);
      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);
      // Zoom
      ctx.scale(zoom, zoom);

      // Draw image
      const drawW = imgSize.width * F;
      const drawH = imgSize.height * F;
      ctx.drawImage(imgRef.current, -drawW / 2, -drawH / 2, drawW, drawH);

      // Convert to blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setSaving(false);
            return;
          }
          try {
            await onSave(blob);
          } finally {
            setSaving(false);
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (err) {
      setSaving(false);
      console.error("Crop error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        style={{
          background: "var(--card-bg, #ffffff)",
          color: "var(--text-main, #1e293b)",
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          width: "100%",
          maxWidth: 440,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          direction: isRtl ? "rtl" : "ltr",
          border: "1px solid var(--border, #e2e8f0)",
          animation: "tabibiFadeIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, var(--brand, #0891b2), #0e7490)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Move size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0c4a6e" }}>
                {t("crop_avatar_title", "Recadrer la photo de profil")}
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>
                {t("crop_instructions", "Glissez pour repositionner et ajustez le zoom.")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: saving ? "not-allowed" : "pointer",
              padding: 6,
              borderRadius: 8,
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Crop Viewport */}
        <div
          style={{
            padding: "20px 0",
            background: "#090d16",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}
        >
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onWheel={handleWheel}
            style={{
              width: VIEWPORT_SIZE,
              height: VIEWPORT_SIZE,
              position: "relative",
              overflow: "hidden",
              borderRadius: "50%",
              cursor: isDragging ? "grabbing" : "grab",
              boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.72), 0 0 0 3px rgba(255, 255, 255, 0.8)",
              background: "#1e293b",
            }}
          >
            {imageSrc && (
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: imgSize.width || "auto",
                  height: imgSize.height || "auto",
                  maxWidth: "none",
                  maxHeight: "none",
                  transformOrigin: "center center",
                  transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isDragging ? "none" : "transform 0.05s ease-out",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ padding: "18px 22px", background: "var(--card-bg, #ffffff)" }}>
          {/* Zoom Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                padding: 4,
              }}
              title={t("zoom_out", "Dézoomer")}
            >
              <ZoomOut size={18} />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: "var(--brand, #0891b2)",
                cursor: "pointer",
                height: 6,
              }}
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)))}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                padding: 4,
              }}
              title={t("zoom_in", "Zoomer")}
            >
              <ZoomIn size={18} />
            </button>
          </div>

          {/* Action Tools (Rotate, Reset) */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
            <button
              type="button"
              onClick={handleRotate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid var(--border, #e2e8f0)",
                background: "var(--bg, #f8fafc)",
                color: "#334155",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg, #f8fafc)")}
            >
              <RotateCw size={15} /> {t("rotate", "Pivoter")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid var(--border, #e2e8f0)",
                background: "var(--bg, #f8fafc)",
                color: "#64748b",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg, #f8fafc)")}
            >
              <RefreshCw size={15} /> {t("reset", "Réinitialiser")}
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={saving}
              style={{ flex: 1, justifyContent: "center", border: "1px solid #cbd5e1", color: "#475569" }}
            >
              {t("cancel", "Annuler")}
            </Btn>
            <Btn
              type="button"
              onClick={handleConfirmCrop}
              loading={saving}
              style={{ flex: 2, justifyContent: "center", background: "linear-gradient(135deg, var(--brand, #0891b2), #0e7490)" }}
            >
              <Check size={17} style={{ [isRtl ? "marginLeft" : "marginRight"]: 6 }} />
              {t("crop_and_save", "Recadrer & Enregistrer")}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
