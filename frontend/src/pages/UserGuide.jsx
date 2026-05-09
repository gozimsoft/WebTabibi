import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  ChevronRight, ChevronLeft, Smartphone, Search, Calendar, 
  Clock, MessageSquare, CheckCircle, Info, Check, Play, X
} from "lucide-react";

const UserGuide = ({ navigate }) => {
  const { t, i18n } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const steps = [
    {
      id: "intro",
      title: t("guide_intro_title"),
      subtitle: t("guide_intro_subtitle"),
      icon: <Smartphone size={32} />,
      image: "/guide/intro.png",
      content: t("guide_intro_content", { returnObjects: true }) || [],
      tip: t("guide_intro_tip")
    },
    {
      id: "search",
      title: t("guide_search_title"),
      subtitle: t("guide_search_subtitle"),
      icon: <Search size={32} />,
      image: "/guide/search.png",
      content: t("guide_search_content", { returnObjects: true }) || [],
      tip: t("guide_search_tip")
    },
    {
      id: "booking",
      title: t("guide_booking_title"),
      subtitle: t("guide_booking_subtitle"),
      icon: <Calendar size={32} />,
      image: "/guide/booking.png",
      content: t("guide_booking_content", { returnObjects: true }) || [],
      tip: t("guide_booking_tip")
    },
    {
      id: "management",
      title: t("guide_mgmt_title"),
      subtitle: t("guide_mgmt_subtitle"),
      icon: <Clock size={32} />,
      image: "/guide/booking.png", 
      content: t("guide_mgmt_content", { returnObjects: true }) || [],
      tip: t("guide_mgmt_tip")
    },
    {
      id: "messaging",
      title: t("guide_chat_title"),
      subtitle: t("guide_chat_subtitle"),
      icon: <MessageSquare size={32} />,
      image: "/guide/chat.png",
      content: t("guide_chat_content", { returnObjects: true }) || [],
      tip: t("guide_chat_tip")
    }
  ];

  const nextStep = () => setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  const prevStep = () => setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));

  // Handle RTL for Arabic
  const isRTL = i18n.language === 'ar';

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{
      maxWidth: 900,
      margin: isMobile ? "5px auto" : "15px auto",
      padding: "0 15px",
      minHeight: isMobile ? "auto" : "60vh",
      display: "flex",
      flexDirection: "column",
      gap: isMobile ? 12 : 20,
      fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <h1 style={{ 
          fontSize: isMobile ? 20 : 26, 
          fontWeight: 900, 
          color: "var(--text-primary)",
          marginBottom: 4,
          lineHeight: 1.1
        }}>
          {t("guide_header_title")} <span style={{ color: "var(--brand)" }}>TABIBI</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: isMobile ? 13 : 15, maxWidth: 600, margin: "0 auto", lineHeight: 1.4 }}>
          {t("guide_header_subtitle")}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        background: "#fff",
        padding: isMobile ? "8px" : "12px 20px",
        borderRadius: 16,
        boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
        position: "relative",
        overflow: "hidden"
      }}>
        {steps.map((s, idx) => (
          <div 
            key={s.id} 
            onClick={() => setActiveStep(idx)}
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: 4,
              cursor: "pointer",
              zIndex: 2,
              flex: 1
            }}
          >
            <div style={{ 
              width: isMobile ? 32 : 40, 
              height: isMobile ? 32 : 40, 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              background: idx <= activeStep ? "var(--brand)" : "var(--brand-light)",
              color: idx <= activeStep ? "#fff" : "var(--brand)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: idx === activeStep ? "scale(1.15)" : "scale(1)",
              boxShadow: idx === activeStep ? "0 8px 20px rgba(0,146,162,0.3)" : "none",
              fontSize: isMobile ? 14 : 16,
              fontWeight: 800
            }}>
              {idx < activeStep ? <Check size={isMobile ? 18 : 20} strokeWidth={3} /> : (idx + 1)}
            </div>
            {!isMobile && (
              <span style={{ 
                fontSize: 11, 
                fontWeight: 700, 
                color: idx === activeStep ? "var(--brand)" : "var(--text-muted)",
                textAlign: "center"
              }}>
                {s.title.split(" ")[0]}
              </span>
            )}
          </div>
        ))}
        {/* Connecting line */}
        <div style={{ 
          position: "absolute", 
          top: isMobile ? 26 : 35, 
          left: "10%", 
          right: "10%", 
          height: 3, 
          background: "var(--brand-light)", 
          zIndex: 1 
        }} />
        <div style={{ 
          position: "absolute", 
          top: isMobile ? 26 : 35, 
          [isRTL ? 'right' : 'left']: "10%", 
          width: `${(activeStep / (steps.length - 1)) * 80}%`, 
          height: 3, 
          background: "var(--brand)", 
          zIndex: 1,
          transition: "width 0.4s ease" 
        }} />
      </div>

      {/* Main Content */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 24 : 36,
        alignItems: "center",
        background: "rgba(255,255,255,0.4)",
        padding: isMobile ? "12px 0" : "20px 24px",
        borderRadius: 20,
        backdropFilter: "blur(10px)",
        textAlign: isRTL ? "right" : "left"
      }}>
        {/* Text Area */}
        <div style={{ 
          animation: "fadeIn 0.5s ease-out"
        }} key={activeStep}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ 
              padding: isMobile ? 10 : 14, 
              background: "var(--brand-light)", 
              borderRadius: 16, 
              color: "var(--brand)" 
            }}>
              {React.cloneElement(steps[activeStep].icon, { size: isMobile ? 24 : 32 })}
            </div>
            <div>
              <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
                {steps[activeStep].title}
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: isMobile ? 12 : 14, marginTop: 2, fontWeight: 600 }}>
                {steps[activeStep].subtitle}
              </p>
            </div>
          </div>

          <ul style={{ 
            listStyle: "none", 
            padding: 0, 
            display: "flex", 
            flexDirection: "column", 
            gap: 10,
            marginBottom: 20
          }}>
            {Array.isArray(steps[activeStep].content) && steps[activeStep].content.map((item, i) => (
              <li key={i} style={{ 
                display: "flex", 
                gap: 14, 
                alignItems: "flex-start",
                background: "#fff",
                padding: "10px 14px",
                borderRadius: 14,
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                transition: "all 0.2s",
                cursor: "default",
                border: "1px solid transparent",
                flexDirection: "row"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = isRTL ? "translateX(-10px)" : "translateX(10px)";
                e.currentTarget.style.borderColor = "var(--brand-light)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.borderColor = "transparent";
              }}
              >
                <div style={{ 
                  marginTop: 2,
                  width: 24, 
                  height: 24, 
                  borderRadius: "8px", 
                  background: "var(--brand)", 
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                  flexShrink: 0
                }}>{i + 1}</div>
                <span style={{ fontSize: isMobile ? 14 : 15, color: "var(--text-primary)", fontWeight: 700, lineHeight: 1.5, flex: 1 }}>{item}</span>
              </li>
            ))}
          </ul>

          <div style={{ 
            background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", 
            padding: "12px 16px", 
            borderRadius: 14,
            border: "1.5px dashed #0ea5e9",
            display: "flex",
            gap: 10,
            alignItems: "center",
            boxShadow: "0 8px 15px rgba(14, 165, 233, 0.1)",
            flexDirection: "row"
          }}>
            <div style={{ background: "#fff", padding: 6, borderRadius: "50%", display: "flex" }}>
              <Info size={20} color="#0284c7" />
            </div>
            <p style={{ margin: 0, color: "#0369a1", fontSize: 13, fontWeight: 800, lineHeight: 1.4, flex: 1 }}>
              {steps[activeStep].tip}
            </p>
          </div>
        </div>

        {/* Visual Area */}
        <div style={{ 
          position: "relative",
          display: "flex",
          justifyContent: "center",
          animation: "fadeIn 0.5s ease-out",
          perspective: 1000
        }} key={`img-${activeStep}`}>
          <div style={{
            position: "absolute",
            width: "120%",
            height: "120%",
            background: "radial-gradient(circle, var(--brand) 0%, transparent 70%)",
            opacity: 0.1,
            zIndex: 0,
            pointerEvents: "none"
          }} />
          
          <div style={{
             position: "relative",
             zIndex: 1,
             padding: 10,
             background: "rgba(255,255,255,0.2)",
             borderRadius: 48,
             backdropFilter: "blur(10px)",
             border: "1px solid rgba(255,255,255,0.4)",
             boxShadow: "0 40px 100px rgba(0,0,0,0.15)",
             transform: isMobile ? "none" : (isRTL ? "rotateY(10deg) rotateX(5deg)" : "rotateY(-10deg) rotateX(5deg)"),
             transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "rotateY(0deg) rotateX(0deg) scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = isMobile ? "none" : (isRTL ? "rotateY(10deg) rotateX(5deg)" : "rotateY(-10deg) rotateX(5deg)")}
          >
            <img 
              src={steps[activeStep].image} 
              alt={steps[activeStep].title}
              style={{ 
                width: "100%", 
                maxWidth: isMobile ? 180 : 220, 
                borderRadius: 24, 
                display: "block"
              }}
            />
          </div>

          {!isMobile && (
             <div style={{
                position: "absolute",
                bottom: 20,
                [isRTL ? 'left' : 'right']: -20,
                background: "#fff",
                padding: "12px 20px",
                borderRadius: 16,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                zIndex: 2,
                animation: "float 3s infinite ease-in-out",
                flexDirection: "row"
             }}>
                <CheckCircle size={20} color="var(--brand)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>{t("guide_step_verified", { num: activeStep + 1 })}</span>
             </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginTop: 5,
        padding: "15px 0",
        borderTop: "1.5px solid var(--border)",
        opacity: 0.9,
        flexDirection: "row"
      }}>
        <button 
          onClick={prevStep}
          disabled={activeStep === 0}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 10,
            padding: isMobile ? "10px 16px" : "12px 24px",
            borderRadius: 16,
            border: "2px solid var(--border)",
            background: "#fff",
            color: activeStep === 0 ? "var(--text-muted)" : "var(--text-primary)",
            fontWeight: 800,
            fontSize: isMobile ? 14 : 16,
            cursor: activeStep === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow: activeStep === 0 ? "none" : "0 4px 10px rgba(0,0,0,0.05)",
            flexDirection: "row"
          }}
          onMouseEnter={e => { if(activeStep > 0) e.currentTarget.style.background = "var(--brand-light)"; }}
          onMouseLeave={e => { if(activeStep > 0) e.currentTarget.style.background = "#fff"; }}
        >
          {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />} {isMobile ? "" : t("guide_prev")}
        </button>

        {activeStep === steps.length - 1 ? (
          <button 
            onClick={() => navigate("/")}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12,
              padding: isMobile ? "10px 20px" : "12px 28px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, var(--brand), var(--brand-dark))",
              color: "#fff",
              fontWeight: 900,
              fontSize: isMobile ? 14 : 16,
              cursor: "pointer",
              boxShadow: "0 12px 24px rgba(0,146,162,0.35)",
              transition: "all 0.3s",
              letterSpacing: isRTL ? 0 : 0.5,
              flexDirection: "row"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            {t("guide_finish")} <Play size={20} fill="#fff" style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
          </button>
        ) : (
          <button 
            onClick={nextStep}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 10,
              padding: isMobile ? "10px 20px" : "12px 28px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, var(--brand), var(--brand-dark))",
              color: "#fff",
              fontWeight: 900,
              fontSize: isMobile ? 14 : 16,
              cursor: "pointer",
              boxShadow: "0 12px 24px rgba(0,146,162,0.35)",
              transition: "all 0.3s",
              flexDirection: "row"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            {t("guide_next")} {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default UserGuide;
