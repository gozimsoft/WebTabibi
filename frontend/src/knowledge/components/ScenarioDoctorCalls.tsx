import React from 'react';
import { PhoneCall, ArrowRight, AlertTriangle } from 'lucide-react';
import { Article } from '../types/article';
import { useLanguage } from '../i18n/LanguageContext';

interface ScenarioDoctorCallsProps {
  articles: Article[];
  onSelectArticle: (slug: string) => void;
}

export const ScenarioDoctorCalls: React.FC<ScenarioDoctorCallsProps> = ({
  articles,
  onSelectArticle
}) => {
  const { t, isRTL } = useLanguage();
  const callScenarios = articles.filter((a) => a.frontmatter.category === 'le-medecin-appelle');

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--kb-text)' }}>
              {t.doctorCallsTitle}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--kb-text-muted)' }}>
              {t.doctorCallsSubtitle}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {callScenarios.map((article) => {
          const { frontmatter, slug } = article;
          return (
            <div
              key={slug}
              style={{
                background: 'var(--kb-surface)',
                border: '1px solid var(--kb-border)',
                borderRadius: 10,
                padding: '20px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--kb-text)', marginBottom: 4 }}>
                    {frontmatter.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontWeight: 600, color: '#475569' }}>
                      TABIBI {frontmatter.tabibi_version}
                    </span>
                    {frontmatter.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 11, color: '#0284c7' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectArticle(slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--kb-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{t.viewProcedure}</span>
                  <ArrowRight size={13} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>

              {/* Symptoms phrases said by doctor */}
              {frontmatter.symptoms_doctor && (
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px 14px', borderRadius: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                    {t.doctorSays}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {frontmatter.symptoms_doctor.map((symp, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#78350f', fontStyle: 'italic' }}>
                        • « {symp} »
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Escalation Threshold */}
              {frontmatter.escalation_threshold && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#be185d' }}>
                  <AlertTriangle size={14} />
                  <span><strong>{t.escalationTitle}</strong> {frontmatter.escalation_threshold}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
