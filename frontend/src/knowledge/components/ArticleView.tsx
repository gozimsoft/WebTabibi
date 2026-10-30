import React from 'react';
import {
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  Printer,
  Tag,
  ExternalLink,
  AlertOctagon,
  PhoneCall
} from 'lucide-react';
import { Article } from '../types/article';
import { renderMarkdownToHtml } from '../services/markdownParser';
import { useLanguage } from '../i18n/LanguageContext';

interface ArticleViewProps {
  article: Article;
  onTagClick: (tag: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ article, onTagClick }) => {
  const { t } = useLanguage();
  const { frontmatter, content, readingTimeMinutes } = article;
  const htmlContent = renderMarkdownToHtml(content);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALIDE':
        return <span className="kb-badge-status valide">{t.statusValide}</span>;
      case 'OBSOLETE':
        return <span className="kb-badge-status obsolete">{t.statusObsolete}</span>;
      default:
        return <span className="kb-badge-status a-verifier">{t.statusAVerifier}</span>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const categoryLabel = t.categories[frontmatter.category]?.label || frontmatter.category;

  return (
    <article className="kb-article-container">
      {/* Article Header & Metadata */}
      <header className="kb-article-meta-header">
        <div className="kb-article-badge-row">
          <span className="kb-badge-category">{categoryLabel}</span>
          {getStatusBadge(frontmatter.status)}
          <span className="kb-badge-version">v{frontmatter.version} (TABIBI {frontmatter.tabibi_version})</span>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              marginInlineStart: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              color: '#334155'
            }}
            title={t.printBtn}
          >
            <Printer size={13} />
            <span>{t.printBtn}</span>
          </button>
        </div>

        <h1 className="kb-article-title">{frontmatter.title}</h1>

        <div className="kb-article-details-strip">
          <div className="kb-article-detail-item">
            <Calendar size={14} />
            <span>{t.validatedOn} <strong>{frontmatter.last_validated}</strong></span>
          </div>
          <div className="kb-article-detail-item">
            <User size={14} />
            <span>{t.writtenBy} <strong>{frontmatter.author}</strong> ({t.revBy} {frontmatter.reviewer})</span>
          </div>
          <div className="kb-article-detail-item">
            <Clock size={14} />
            <span>{t.readingTime.replace('{min}', String(readingTimeMinutes))}</span>
          </div>
        </div>
      </header>

      {/* Levels Banner (L1, L2, L3) */}
      <div className="kb-levels-banner">
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--kb-text-muted)' }}>
          {t.levelsCovered}
        </span>
        <div className="kb-levels-list">
          {frontmatter.level_support.includes('L1') && (
            <span className="kb-level-chip l1" title="Niveau 1">
              <CheckCircle size={13} />
              {t.levelL1}
            </span>
          )}
          {frontmatter.level_support.includes('L2') && (
            <span className="kb-level-chip l2" title="Niveau 2">
              <AlertTriangle size={13} />
              {t.levelL2}
            </span>
          )}
          {frontmatter.level_support.includes('L3') && (
            <span className="kb-level-chip l3" title="Niveau 3">
              <ExternalLink size={13} />
              {t.levelL3}
            </span>
          )}
        </div>
      </div>

      {/* Symptoms Box (If doctor calls symptom list is present) */}
      {frontmatter.symptoms_doctor && frontmatter.symptoms_doctor.length > 0 && (
        <div className="kb-symptoms-box">
          <div className="kb-symptoms-header">
            <PhoneCall size={15} />
            <span>{t.doctorSymptomsTitle}</span>
          </div>
          <div>
            {frontmatter.symptoms_doctor.map((symptom, idx) => (
              <span key={idx} className="kb-symptom-tag">
                « {symptom} »
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rendered Markdown Body */}
      <div
        className="kb-markdown-body"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Escalation Threshold Alert (If present) */}
      {frontmatter.escalation_threshold && (
        <div className="kb-escalation-alert">
          <AlertOctagon size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>{t.escalationTitle}</strong>{' '}
            {frontmatter.escalation_threshold}
          </div>
        </div>
      )}

      {/* Tags footer */}
      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <footer style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--kb-border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Tag size={13} color="var(--kb-text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--kb-text-muted)', fontWeight: 600 }}>{t.tagsLabel}</span>
          {frontmatter.tags.map((tItem) => (
            <button
              key={tItem}
              type="button"
              onClick={() => onTagClick(tItem)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 11,
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              #{tItem}
            </button>
          ))}
        </footer>
      )}
    </article>
  );
};
