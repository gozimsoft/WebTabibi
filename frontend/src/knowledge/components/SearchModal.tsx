import React, { useState, useEffect, useRef } from 'react';
import { Search, X, PhoneCall } from 'lucide-react';
import { Article, SearchResult } from '../types/article';
import { searchArticles } from '../services/searchEngine';
import { useLanguage } from '../i18n/LanguageContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setResults(searchArticles(articles, query));
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const res = searchArticles(articles, query);
    setResults(res);
    setSelectedIndex(0);
  }, [query, articles]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectArticle(results[selectedIndex].article.slug);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="kb-search-backdrop" onClick={onClose}>
      <div className="kb-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kb-search-input-wrap">
          <Search size={18} color="var(--kb-text-muted)" />
          <input
            ref={inputRef}
            type="text"
            className="kb-search-input"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--kb-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="kb-search-results">
          {results.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--kb-text-muted)', fontSize: 14 }}>
              {t.searchNoResults}
            </div>
          ) : (
            results.slice(0, 10).map((res, index) => {
              const isSelected = index === selectedIndex;
              const { article, matchedFields, snippet } = res;
              const isDoctorCall = article.frontmatter.category === 'le-medecin-appelle';
              const catLabel = t.categories[article.frontmatter.category]?.label || article.frontmatter.category;

              return (
                <div
                  key={article.slug}
                  className={`kb-search-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectArticle(article.slug);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="kb-search-item-title">
                      {isDoctorCall && <PhoneCall size={13} style={{ display: 'inline', marginInlineEnd: 6, color: '#d97706' }} />}
                      {article.frontmatter.title}
                    </div>
                    <span style={{ fontSize: 11, background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, color: '#64748b' }}>
                      {catLabel}
                    </span>
                  </div>

                  <div className="kb-search-item-snippet">{snippet}</div>

                  <div className="kb-search-item-meta">
                    {matchedFields.includes('symptoms') && (
                      <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>
                        Symptôme détecté
                      </span>
                    )}
                    {article.frontmatter.tags.slice(0, 3).map((tag) => (
                      <span key={tag} style={{ fontSize: 11, color: '#0284c7' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid var(--kb-border)', fontSize: 11, color: 'var(--kb-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{t.searchHint}</span>
          <span>{t.searchEsc}</span>
        </div>
      </div>
    </div>
  );
};
