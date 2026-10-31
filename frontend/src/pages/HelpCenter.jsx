// frontend/src/pages/HelpCenter.jsx
// Centre d'aide en ligne TABIBI pour les patients (FR / AR / EN)
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Search, Compass, User, Calendar, Clock, Bell,
  ShieldCheck, HelpCircle, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Check, ArrowRight, ArrowLeft,
  BookOpen, Sparkles, LifeBuoy, MessageSquare, AlertCircle,
  Lightbulb, X, Share2, Eye
} from "lucide-react";
import { HELP_CATEGORIES, HELP_ARTICLES, HELP_FAQS } from "../data/helpCenterData";

// Icon mapping helper
const getCategoryIcon = (iconName, size = 24, color = "currentColor") => {
  switch (iconName) {
    case "Compass": return <Compass size={size} color={color} />;
    case "User": return <User size={size} color={color} />;
    case "Calendar": return <Calendar size={size} color={color} />;
    case "Clock": return <Clock size={size} color={color} />;
    case "Bell": return <Bell size={size} color={color} />;
    case "ShieldCheck": return <ShieldCheck size={size} color={color} />;
    case "HelpCircle": return <HelpCircle size={size} color={color} />;
    default: return <BookOpen size={size} color={color} />;
  }
};

export default function HelpCenter({ navigate, qs = "", user = null }) {
  const { t, i18n } = useTranslation();
  const currentLang = ["ar", "en", "fr"].includes(i18n.language) ? i18n.language : "fr";
  const isAr = currentLang === "ar";

  // URL Query / Hash state parsing
  const parseParams = () => {
    try {
      const searchStr = qs || (window.location.hash.includes("?") ? window.location.hash.split("?")[1] : "");
      const params = new URLSearchParams(searchStr);
      return {
        article: params.get("article") || null,
        category: params.get("category") || null,
        query: params.get("q") || ""
      };
    } catch (_) {
      return { article: null, category: null, query: "" };
    }
  };

  const initialParams = parseParams();
  const [activeArticleSlug, setActiveArticleSlug] = useState(initialParams.article);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialParams.category);
  const [searchQuery, setSearchQuery] = useState(initialParams.query);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  // Sync state with URL params
  useEffect(() => {
    const p = parseParams();
    if (p.article !== activeArticleSlug) setActiveArticleSlug(p.article);
    if (p.category !== selectedCategoryId) setSelectedCategoryId(p.category);
    if (p.query && p.query !== searchQuery) setSearchQuery(p.query);
  }, [qs]);

  // Load existing feedbacks from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tabibi_help_feedback") || "{}");
      setFeedbackGiven(saved);
    } catch (_) {}
  }, []);

  const handleFeedback = (articleSlug, isHelpful) => {
    const updated = { ...feedbackGiven, [articleSlug]: isHelpful ? "yes" : "no" };
    setFeedbackGiven(updated);
    try {
      localStorage.setItem("tabibi_help_feedback", JSON.stringify(updated));
    } catch (_) {}
  };

  // Switch to specific article
  const openArticle = (slug) => {
    setActiveArticleSlug(slug);
    setSelectedCategoryId(null);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Switch to category view
  const openCategory = (catId) => {
    setSelectedCategoryId(catId);
    setActiveArticleSlug(null);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to Help Center Home
  const openHome = () => {
    setActiveArticleSlug(null);
    setSelectedCategoryId(null);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Active article data
  const currentArticle = useMemo(() => {
    if (!activeArticleSlug) return null;
    return HELP_ARTICLES.find(a => a.slug === activeArticleSlug) || null;
  }, [activeArticleSlug]);

  // Active category data
  const currentCategory = useMemo(() => {
    if (selectedCategoryId) {
      return HELP_CATEGORIES.find(c => c.id === selectedCategoryId) || null;
    }
    if (currentArticle) {
      return HELP_CATEGORIES.find(c => c.id === currentArticle.categoryId) || null;
    }
    return null;
  }, [selectedCategoryId, currentArticle]);

  // Articles in selected category
  const categoryArticles = useMemo(() => {
    if (!selectedCategoryId) return [];
    return HELP_ARTICLES.filter(a => a.categoryId === selectedCategoryId);
  }, [selectedCategoryId]);

  // Live Search Filtering
  const searchResults = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return null;

    const matchedArticles = HELP_ARTICLES.filter(article => {
      const title = (article.titles[currentLang] || article.titles.fr || "").toLowerCase();
      const summary = (article.summaries[currentLang] || article.summaries.fr || "").toLowerCase();
      const content = article.content[currentLang] || article.content.fr || {};
      const intro = (content.intro || "").toLowerCase();
      const steps = (content.steps || []).map(s => `${s.title} ${s.desc}`).join(" ").toLowerCase();

      return title.includes(q) || summary.includes(q) || intro.includes(q) || steps.includes(q);
    });

    const matchedFaqs = HELP_FAQS.filter(faq => {
      const question = (faq.questions[currentLang] || faq.questions.fr || "").toLowerCase();
      const answer = (faq.answers[currentLang] || faq.answers.fr || "").toLowerCase();
      return question.includes(q) || answer.includes(q);
    });

    return { articles: matchedArticles, faqs: matchedFaqs };
  }, [searchQuery, currentLang]);

  // Popular articles list
  const popularArticles = useMemo(() => {
    return HELP_ARTICLES.filter(a => a.isPopular);
  }, []);

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "var(--bg, #f8fafc)",
        color: "var(--text-main, #0f172a)",
        fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
        paddingBottom: 60
      }}
    >
      {/* ── 1. HERO SECTION ─────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0c4a6e 0%, #0092a2 60%, #06b6d4 100%)",
          color: "#ffffff",
          padding: "54px 20px 48px",
          textAlign: "center",
          position: "relative",
          boxShadow: "0 10px 30px rgba(0, 146, 162, 0.15)"
        }}
      >
        <div style={{ maxWidth: 840, margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.16)",
              backdropFilter: "blur(6px)",
              padding: "6px 16px",
              borderRadius: 30,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16
            }}
          >
            <LifeBuoy size={16} color="#7ffff4" />
            <span>{t("help_badge", "Centre d'aide pour les patients")}</span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 900,
              margin: "0 0 14px",
              lineHeight: 1.2
            }}
          >
            {t("help_hero_title", "Comment pouvons-nous vous aider ?")}
          </h1>

          <p
            style={{
              fontSize: "clamp(14px, 2vw, 17px)",
              color: "rgba(255, 255, 255, 0.88)",
              maxWidth: 620,
              margin: "0 auto 30px",
              lineHeight: 1.6
            }}
          >
            {t(
              "help_hero_desc",
              "Retrouvez tous les guides d'utilisation, conseils et réponses pour trouver un médecin et prendre vos rendez-vous en toute sérénité."
            )}
          </p>

          {/* Instant Search Input */}
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              position: "relative",
              display: "flex",
              alignItems: "center",
              background: "var(--card-bg, #ffffff)",
              borderRadius: 16,
              padding: "6px 14px",
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.22)"
            }}
          >
            <Search size={22} color="#0891b2" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeArticleSlug) setActiveArticleSlug(null);
                if (selectedCategoryId) setSelectedCategoryId(null);
              }}
              placeholder={t("help_search_placeholder", "Rechercher un tutoriel, une question ou une spécialité...")}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "12px 14px",
                fontSize: 15,
                color: "var(--text-main, #0f172a)",
                background: "transparent",
                fontFamily: "inherit"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 4,
                  display: "flex",
                  alignItems: "center"
                }}
                title={t("clear", "Effacer")}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── BREADCRUMBS (Fil d'Ariane) ────────────────────────── */}
      {(activeArticleSlug || selectedCategoryId || searchQuery) && (
        <div style={{ maxWidth: 1120, margin: "20px auto 0", padding: "0 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-muted, #64748b)",
              flexWrap: "wrap"
            }}
          >
            <button
              onClick={openHome}
              style={{
                background: "none",
                border: "none",
                color: "var(--brand, #0092a2)",
                cursor: "pointer",
                padding: 0,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <LifeBuoy size={14} />
              <span>{t("help_home", "Centre d'aide")}</span>
            </button>

            {currentCategory && (
              <>
                <span>/</span>
                <button
                  onClick={() => openCategory(currentCategory.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: activeArticleSlug ? "var(--brand, #0092a2)" : "var(--text-main, #0f172a)",
                    cursor: activeArticleSlug ? "pointer" : "default",
                    padding: 0,
                    fontWeight: activeArticleSlug ? 600 : 800
                  }}
                >
                  {currentCategory.titles[currentLang] || currentCategory.titles.fr}
                </button>
              </>
            )}

            {currentArticle && (
              <>
                <span>/</span>
                <span style={{ color: "var(--text-main, #0f172a)", fontWeight: 800 }}>
                  {currentArticle.titles[currentLang] || currentArticle.titles.fr}
                </span>
              </>
            )}

            {searchQuery && (
              <>
                <span>/</span>
                <span>
                  {t("help_search_results_for", "Résultats pour")} : « <strong>{searchQuery}</strong> »
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ──────────────────────────── */}
      <main style={{ maxWidth: 1120, margin: "28px auto 0", padding: "0 20px" }}>

        {/* ── CASE 1: SEARCH RESULTS VIEW ──────────────────── */}
        {searchResults && (
          <div>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                {t("help_search_results_title", "Résultats de recherche")}
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)", [isAr ? "marginRight" : "marginLeft"]: 10 }}>
                  ({searchResults.articles.length} {t("help_articles_count", "articles")}, {searchResults.faqs.length} {t("help_faqs_count", "questions")})
                </span>
              </h2>
              <button
                onClick={openHome}
                style={{
                  background: "none",
                  border: "1px solid var(--border, #e2e8f0)",
                  borderRadius: 10,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--text-secondary)"
                }}
              >
                {t("help_back_to_home", "Retour à l'accueil")}
              </button>
            </div>

            {/* No Results Message */}
            {searchResults.articles.length === 0 && searchResults.faqs.length === 0 ? (
              <div
                style={{
                  background: "var(--card-bg, #ffffff)",
                  borderRadius: 20,
                  padding: "60px 24px",
                  textAlign: "center",
                  border: "1px solid var(--border, #e2e8f0)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    color: "#94a3b8"
                  }}
                >
                  <Search size={32} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "var(--text-main)" }}>
                  {t("help_no_results", "Aucun résultat trouvé pour votre recherche")}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 520, margin: "0 auto 20px" }}>
                  {t(
                    "help_no_results_desc",
                    "Essayez avec d'autres mots-clés (ex: rendez-vous, compte, annuler, médecin) ou consultez les catégories ci-dessous."
                  )}
                </p>
                <button
                  onClick={openHome}
                  style={{
                    background: "var(--brand, #0092a2)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 22px",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer"
                  }}
                >
                  {t("help_see_all_categories", "Voir toutes les catégories")}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {/* Articles Matches */}
                {searchResults.articles.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "var(--brand)" }}>
                      {t("help_matching_articles", "Articles correspondants :")}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                      {searchResults.articles.map((art) => (
                        <div
                          key={art.slug}
                          onClick={() => openArticle(art.slug)}
                          style={{
                            background: "var(--card-bg, #ffffff)",
                            border: "1px solid var(--border, #e2e8f0)",
                            borderRadius: 16,
                            padding: 20,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-3px)";
                            e.currentTarget.style.borderColor = "var(--brand, #0092a2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.borderColor = "var(--border, #e2e8f0)";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                            <BookOpen size={14} color="var(--brand)" />
                            <span>{art.readTime}</span>
                          </div>
                          <h4 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px", color: "var(--text-main)" }}>
                            {art.titles[currentLang] || art.titles.fr}
                          </h4>
                          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                            {art.summaries[currentLang] || art.summaries.fr}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ Matches */}
                {searchResults.faqs.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "var(--brand)" }}>
                      {t("help_matching_faqs", "Questions fréquentes correspondantes :")}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {searchResults.faqs.map((faq) => {
                        const isOpen = openFaqId === faq.id;
                        return (
                          <div
                            key={faq.id}
                            style={{
                              background: "var(--card-bg, #ffffff)",
                              border: "1px solid var(--border, #e2e8f0)",
                              borderRadius: 14,
                              overflow: "hidden"
                            }}
                          >
                            <button
                              onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                              style={{
                                width: "100%",
                                padding: "16px 20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                textAlign: isAr ? "right" : "left",
                                fontSize: 15,
                                fontWeight: 700,
                                color: "var(--text-main)",
                                fontFamily: "inherit"
                              }}
                            >
                              <span>{faq.questions[currentLang] || faq.questions.fr}</span>
                              {isOpen ? <ChevronUp size={18} color="var(--brand)" /> : <ChevronDown size={18} color="#94a3b8" />}
                            </button>
                            {isOpen && (
                              <div
                                style={{
                                  padding: "0 20px 18px",
                                  fontSize: 14,
                                  color: "var(--text-secondary)",
                                  lineHeight: 1.6,
                                  borderTop: "1px solid var(--border, #f1f5f9)",
                                  paddingTop: 12
                                }}
                              >
                                {faq.answers[currentLang] || faq.answers.fr}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CASE 2: SINGLE ARTICLE VIEW ──────────────────── */}
        {!searchResults && currentArticle && (
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            <article
              style={{
                background: "var(--card-bg, #ffffff)",
                borderRadius: 22,
                padding: "36px 32px",
                border: "1px solid var(--border, #e2e8f0)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.04)"
              }}
            >
              {/* Category & Read Time Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                {currentCategory && (
                  <button
                    onClick={() => openCategory(currentCategory.id)}
                    style={{
                      background: "rgba(0, 146, 162, 0.08)",
                      color: "var(--brand, #0092a2)",
                      border: "none",
                      padding: "5px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    {getCategoryIcon(currentCategory.icon, 14, "var(--brand, #0092a2)")}
                    <span>{currentCategory.titles[currentLang] || currentCategory.titles.fr}</span>
                  </button>
                )}
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>•</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Clock size={14} />
                  {currentArticle.readTime} {t("help_read_time", "de lecture")}
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: "clamp(22px, 3vw, 30px)",
                  fontWeight: 900,
                  color: "var(--text-main, #0f172a)",
                  margin: "0 0 16px",
                  lineHeight: 1.3
                }}
              >
                {currentArticle.titles[currentLang] || currentArticle.titles.fr}
              </h1>

              {/* Summary / Lead */}
              <p
                style={{
                  fontSize: 16,
                  color: "var(--text-secondary, #475569)",
                  lineHeight: 1.7,
                  margin: "0 0 28px",
                  paddingBottom: 20,
                  borderBottom: "1px solid var(--border, #f1f5f9)"
                }}
              >
                {(currentArticle.content[currentLang] || currentArticle.content.fr).intro}
              </p>

              {/* Numbered Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                {(currentArticle.content[currentLang] || currentArticle.content.fr).steps.map((st, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                      background: "var(--bg, #f8fafc)",
                      padding: "18px 20px",
                      borderRadius: 16,
                      border: "1px solid var(--border, #e2e8f0)"
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "var(--brand, #0092a2)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: 15,
                        flexShrink: 0,
                        boxShadow: "0 4px 10px rgba(0, 146, 162, 0.25)"
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px", color: "var(--text-main)" }}>
                        {st.title}
                      </h3>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                        {st.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tip Callout */}
              {(currentArticle.content[currentLang] || currentArticle.content.fr).tip && (
                <div
                  style={{
                    background: "rgba(14, 165, 233, 0.08)",
                    border: "1.5px solid #38bdf8",
                    borderRadius: 16,
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    marginBottom: 20
                  }}
                >
                  <Lightbulb size={22} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 14, color: "#0369a1", lineHeight: 1.6, fontWeight: 500 }}>
                    <strong>{t("help_tip_label", "Conseil pratique :")} </strong>
                    {(currentArticle.content[currentLang] || currentArticle.content.fr).tip}
                  </div>
                </div>
              )}

              {/* Warning Callout */}
              {(currentArticle.content[currentLang] || currentArticle.content.fr).warning && (
                <div
                  style={{
                    background: "#fff1f2",
                    border: "1.5px solid #fda4af",
                    borderRadius: 16,
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    marginBottom: 32
                  }}
                >
                  <AlertCircle size={22} color="#e11d48" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 14, color: "#be123c", lineHeight: 1.6, fontWeight: 500 }}>
                    <strong>{t("help_warning_label", "Remarque importante :")} </strong>
                    {(currentArticle.content[currentLang] || currentArticle.content.fr).warning}
                  </div>
                </div>
              )}

              {/* Feedback Widget */}
              <div
                style={{
                  background: "var(--bg, #f8fafc)",
                  borderRadius: 16,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                  borderTop: "1px solid var(--border, #e2e8f0)"
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
                    {t("help_feedback_question", "Cet article vous a-t-il été utile ?")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {t("help_feedback_desc", "Vos retours nous aident à améliorer continuellement la documentation.")}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {feedbackGiven[currentArticle.slug] ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#059669", fontSize: 13, fontWeight: 700 }}>
                      <Check size={16} />
                      <span>{t("help_feedback_thanks", "Merci pour votre retour !")}</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleFeedback(currentArticle.slug, true)}
                        style={{
                          background: "var(--card-bg, #ffffff)",
                          border: "1px solid var(--border, #cbd5e1)",
                          borderRadius: 10,
                          padding: "8px 16px",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#059669"
                        }}
                      >
                        <ThumbsUp size={15} />
                        <span>{t("yes", "Oui")}</span>
                      </button>
                      <button
                        onClick={() => handleFeedback(currentArticle.slug, false)}
                        style={{
                          background: "var(--card-bg, #ffffff)",
                          border: "1px solid var(--border, #cbd5e1)",
                          borderRadius: 10,
                          padding: "8px 16px",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#dc2626"
                        }}
                      >
                        <ThumbsDown size={15} />
                        <span>{t("no", "Non")}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>

            {/* Back Button & Related Articles */}
            <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
              {currentCategory && (
                <button
                  onClick={() => openCategory(currentCategory.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand)",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                  <span>
                    {t("help_back_to_category", "Tous les articles de")} {currentCategory.titles[currentLang] || currentCategory.titles.fr}
                  </span>
                </button>
              )}

              <button
                onClick={openHome}
                style={{
                  background: "var(--card-bg, #ffffff)",
                  border: "1px solid var(--border, #e2e8f0)",
                  borderRadius: 10,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "var(--text-secondary)"
                }}
              >
                {t("help_all_categories", "Accueil du Centre d'aide")}
              </button>
            </div>
          </div>
        )}

        {/* ── CASE 3: CATEGORY VIEW (List of Articles) ─────── */}
        {!searchResults && !currentArticle && selectedCategoryId && currentCategory && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <button
                onClick={openHome}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--brand)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12
                }}
              >
                {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                <span>{t("help_back_to_home", "Retour à l'accueil")}</span>
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: `${currentCategory.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: currentCategory.color
                  }}
                >
                  {getCategoryIcon(currentCategory.icon, 28, currentCategory.color)}
                </div>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px", color: "var(--text-main)" }}>
                    {currentCategory.titles[currentLang] || currentCategory.titles.fr}
                  </h2>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                    {currentCategory.descriptions[currentLang] || currentCategory.descriptions.fr}
                  </p>
                </div>
              </div>
            </div>

            {/* Articles Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
              {categoryArticles.map((art) => (
                <div
                  key={art.slug}
                  onClick={() => openArticle(art.slug)}
                  style={{
                    background: "var(--card-bg, #ffffff)",
                    border: "1px solid var(--border, #e2e8f0)",
                    borderRadius: 18,
                    padding: 24,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = currentCategory.color;
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "var(--border, #e2e8f0)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={13} />
                        {art.readTime}
                      </span>
                      {art.isPopular && (
                        <span
                          style={{
                            background: "rgba(245, 158, 11, 0.12)",
                            color: "#d97706",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: 12
                          }}
                        >
                          {t("help_popular_badge", "Populaire")}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 10px", color: "var(--text-main)" }}>
                      {art.titles[currentLang] || art.titles.fr}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                      {art.summaries[currentLang] || art.summaries.fr}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      color: currentCategory.color
                    }}
                  >
                    <span>{t("help_read_guide", "Lire le guide complet")}</span>
                    {isAr ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CASE 4: HOME VIEW (Default Categories, Popular & FAQ) ── */}
        {!searchResults && !currentArticle && !selectedCategoryId && (
          <div>
            {/* Section: 8 Categories Grid */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", color: "var(--text-main)" }}>
                  {t("help_categories_title", "Explorez par thématique")}
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                  {t("help_categories_desc", "Sélectionnez un domaine pour consulter tous les tutoriels et explications détaillées.")}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: 18
                }}
              >
                {HELP_CATEGORIES.map((cat) => {
                  const articleCount = HELP_ARTICLES.filter(a => a.categoryId === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => openCategory(cat.id)}
                      style={{
                        background: "var(--card-bg, #ffffff)",
                        border: "1px solid var(--border, #e2e8f0)",
                        borderRadius: 18,
                        padding: 24,
                        cursor: "pointer",
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.borderColor = cat.color;
                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "var(--border, #e2e8f0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: `${cat.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: cat.color,
                          marginBottom: 16
                        }}
                      >
                        {getCategoryIcon(cat.icon, 24, cat.color)}
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px", color: "var(--text-main)" }}>
                        {cat.titles[currentLang] || cat.titles.fr}
                      </h3>

                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5, flex: 1 }}>
                        {cat.descriptions[currentLang] || cat.descriptions.fr}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: cat.color }}>
                        <span>
                          {articleCount} {articleCount > 1 ? t("help_articles_count", "articles") : t("help_article_count", "article")}
                        </span>
                        {isAr ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: Popular Articles */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Sparkles size={20} color="#d97706" />
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                  {t("help_popular_title", "Tutoriels les plus consultés")}
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
                {popularArticles.map((art) => (
                  <div
                    key={art.slug}
                    onClick={() => openArticle(art.slug)}
                    style={{
                      background: "var(--card-bg, #ffffff)",
                      border: "1px solid var(--border, #e2e8f0)",
                      borderRadius: 16,
                      padding: "20px 22px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.borderColor = "var(--brand, #0092a2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "var(--border, #e2e8f0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                      <BookOpen size={14} color="var(--brand)" />
                      <span>{art.readTime}</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px", color: "var(--text-main)" }}>
                      {art.titles[currentLang] || art.titles.fr}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      {art.summaries[currentLang] || art.summaries.fr}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Frequently Asked Questions (Accordion) */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", color: "var(--text-main)" }}>
                  {t("help_faq_title", "Questions fréquentes (FAQ)")}
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
                  {t("help_faq_desc", "Les réponses rapides aux questions que se posent le plus souvent les patients.")}
                </p>
              </div>

              <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
                {HELP_FAQS.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      style={{
                        background: "var(--card-bg, #ffffff)",
                        border: "1px solid var(--border, #e2e8f0)",
                        borderRadius: 16,
                        overflow: "hidden",
                        transition: "border-color 0.2s"
                      }}
                    >
                      <button
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        style={{
                          width: "100%",
                          padding: "18px 22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textAlign: isAr ? "right" : "left",
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--text-main)",
                          fontFamily: "inherit"
                        }}
                      >
                        <span style={{ flex: 1, [isAr ? "paddingLeft" : "paddingRight"]: 12 }}>
                          {faq.questions[currentLang] || faq.questions.fr}
                        </span>
                        {isOpen ? <ChevronUp size={20} color="var(--brand)" /> : <ChevronDown size={20} color="#94a3b8" />}
                      </button>
                      {isOpen && (
                        <div
                          style={{
                            padding: "0 22px 20px",
                            fontSize: 14,
                            color: "var(--text-secondary)",
                            lineHeight: 1.6,
                            borderTop: "1px solid var(--border, #f1f5f9)",
                            paddingTop: 14
                          }}
                        >
                          {faq.answers[currentLang] || faq.answers.fr}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: Direct Support Access */}
            <div
              style={{
                background: "linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)",
                border: "1.5px solid #99f6e4",
                borderRadius: 22,
                padding: "36px 30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 24
              }}
            >
              <div style={{ maxWidth: 560 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#0f766e", fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
                  <MessageSquare size={18} />
                  <span>{t("help_support_box_badge", "Une question non résolue ?")}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#134e4a", margin: "0 0 8px" }}>
                  {t("help_support_box_title", "Notre équipe administrative est là pour vous assister")}
                </h3>
                <p style={{ fontSize: 14, color: "#115e59", margin: 0, lineHeight: 1.6 }}>
                  {t(
                    "help_support_box_desc",
                    "Si vous rencontrez un souci technique avec votre compte ou souhaitez transmettre une réclamation, déposez un ticket directement auprès de l'équipe TABIBI."
                  )}
                </p>
              </div>

              <div>
                <button
                  onClick={() => {
                    if (user) {
                      navigate(user.user_type === 3 || user.user_type === 4 ? "/admin?tab=support_tickets" : "/support-tickets");
                    } else {
                      navigate("/login");
                    }
                  }}
                  style={{
                    background: "linear-gradient(135deg, #0092a2, #0c4a6e)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px 28px",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(0, 146, 162, 0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    whiteSpace: "nowrap"
                  }}
                >
                  <LifeBuoy size={18} />
                  <span>{t("help_contact_support_btn", "Contacter le support TABIBI")}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
