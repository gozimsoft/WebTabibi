import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { NavigationSidebar } from './components/NavigationSidebar';
import { ArticleView } from './components/ArticleView';
import { ScenarioDoctorCalls } from './components/ScenarioDoctorCalls';
import { SearchModal } from './components/SearchModal';
import {
  loadAllArticles,
  CATEGORIES_CONFIG,
  getArticlesForLanguage,
  getArticleBySlugAndLang
} from './services/contentLoader';
import { Article } from './types/article';
import { ExternalLink, Sparkles } from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

const MainLayout: React.FC = () => {
  const { language, t } = useLanguage();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('consultations');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const loaded = loadAllArticles();
    setAllArticles(loaded);

    // Support direct article linking (e.g. #article=cycle-de-vie-consultation)
    const checkHashArticle = (articles: Article[]) => {
      const hash = window.location.hash;
      const match = hash.match(/article=([a-zA-Z0-9_-]+)/);
      if (match) {
        const targetSlug = match[1];
        const found = articles.find((a) => a.slug === targetSlug);
        if (found) {
          setSelectedCategory(found.frontmatter.category);
          setSelectedArticleSlug(found.slug);
          return true;
        }
      }
      return false;
    };

    if (!checkHashArticle(loaded)) {
      const firstConsult = loaded.find((a) => a.frontmatter.category === 'consultations');
      if (firstConsult) {
        setSelectedArticleSlug(firstConsult.slug);
      }
    }

    const onHashChange = () => {
      checkHashArticle(loaded);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Filter articles for current language with fallback
  const displayedArticles = useMemo(() => {
    return getArticlesForLanguage(allArticles, language);
  }, [allArticles, language]);

  // Current article in the currently selected language
  const currentArticle = useMemo(() => {
    if (!selectedArticleSlug) return null;
    return getArticleBySlugAndLang(allArticles, selectedArticleSlug, language);
  }, [allArticles, selectedArticleSlug, language]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedTag(null);

    if (catId === 'le-medecin-appelle') {
      setSelectedArticleSlug(null);
      return;
    }

    const first = displayedArticles.find((a) => a.frontmatter.category === catId);
    if (first) {
      setSelectedArticleSlug(first.slug);
    } else {
      setSelectedArticleSlug(null);
    }
  };

  const handleSelectArticle = (slug: string) => {
    const target = displayedArticles.find((a) => a.slug === slug);
    if (target) {
      setSelectedCategory(target.frontmatter.category);
      setSelectedArticleSlug(slug);
    } else {
      setSelectedArticleSlug(slug);
    }
  };

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag(tag);
    if (tag) {
      const match = displayedArticles.find((a) => a.frontmatter.tags.includes(tag));
      if (match) {
        setSelectedCategory(match.frontmatter.category);
        setSelectedArticleSlug(match.slug);
      }
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentCategory = CATEGORIES_CONFIG.find((c) => c.id === selectedCategory);

  return (
    <div className="kb-app">
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onHomeClick={() => {
          setSelectedCategory('consultations');
          const first = displayedArticles.find((a) => a.frontmatter.category === 'consultations');
          if (first) setSelectedArticleSlug(first.slug);
        }}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="kb-body-layout">
        {isSidebarOpen && (
          <div
            className="kb-sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <NavigationSidebar
          categories={CATEGORIES_CONFIG}
          articles={displayedArticles}
          selectedCategory={selectedCategory}
          selectedArticleSlug={selectedArticleSlug}
          selectedTag={selectedTag}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectCategory={(catId) => {
            handleSelectCategory(catId);
            setIsSidebarOpen(false);
          }}
          onSelectArticle={(slug) => {
            handleSelectArticle(slug);
            setIsSidebarOpen(false);
          }}
          onSelectTag={(tag) => {
            handleSelectTag(tag);
            setIsSidebarOpen(false);
          }}
        />

        <main className="kb-main-content">
          {currentArticle ? (
            <ArticleView
              article={currentArticle}
              onTagClick={handleSelectTag}
            />
          ) : selectedCategory === 'le-medecin-appelle' ? (
            <ScenarioDoctorCalls
              articles={displayedArticles}
              onSelectArticle={handleSelectArticle}
            />
          ) : currentCategory && !currentCategory.isV1 ? (
            <div className="kb-article-container" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
                <Sparkles size={24} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                {t.categories[currentCategory.id]?.label || currentCategory.label}
              </h2>
              <p style={{ color: 'var(--tabibi-text-secondary)', fontSize: 14, maxWidth: 520, margin: '0 auto 24px auto' }}>
                {t.muraqibNotice}
              </p>

              {currentCategory.muraqibDocUrl && (
                <a
                  href={currentCategory.muraqibDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--tabibi-primary)',
                    color: 'white',
                    padding: '10px 18px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <span>{t.seeMuraqibDoc}</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--tabibi-text-muted)' }}>
              {t.selectArticleHint}
            </div>
          )}
        </main>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={displayedArticles}
        onSelectArticle={handleSelectArticle}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <MainLayout />
    </LanguageProvider>
  );
};
