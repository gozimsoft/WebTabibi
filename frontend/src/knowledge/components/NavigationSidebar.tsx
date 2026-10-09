import React from 'react';
import {
  Users,
  Calendar,
  Contact,
  Stethoscope,
  FileCheck,
  FileText,
  Layers,
  Sparkles,
  Award,
  Pill,
  BarChart2,
  Settings,
  PhoneCall,
  HelpCircle,
  Wrench,
  Server,
  HardDrive,
  Lock,
  Tag,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Article, CategoryInfo } from '../types/article';
import { useLanguage } from '../i18n/LanguageContext';

interface NavigationSidebarProps {
  categories: CategoryInfo[];
  articles: Article[];
  selectedCategory: string | null;
  selectedArticleSlug: string | null;
  selectedTag: string | null;
  onSelectCategory: (categoryId: string) => void;
  onSelectArticle: (slug: string) => void;
  onSelectTag: (tag: string | null) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  categories,
  articles,
  selectedCategory,
  selectedArticleSlug,
  selectedTag,
  onSelectCategory,
  onSelectArticle,
  onSelectTag,
  isOpen
}) => {
  const { t, isRTL } = useLanguage();

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'reception': return <Users size={16} />;
      case 'rendez-vous': return <Calendar size={16} />;
      case 'patients': return <Contact size={16} />;
      case 'consultations': return <Stethoscope size={16} />;
      case 'prescriptions': return <FileCheck size={16} />;
      case 'documents-medicaux': return <FileText size={16} />;
      case 'dicom': return <Layers size={16} />;
      case 'dentaire': return <Sparkles size={16} color="#0284c7" />;
      case 'certificats-rapports': return <Award size={16} />;
      case 'medicaments': return <Pill size={16} />;
      case 'gestion': return <BarChart2 size={16} />;
      case 'parametres': return <Settings size={16} />;
      case 'le-medecin-appelle': return <PhoneCall size={16} color="#d97706" />;
      case 'faq-medecins': return <HelpCircle size={16} />;
      case 'installation': return <Wrench size={16} />;
      case 'reseau-serveur': return <Server size={16} />;
      case 'sauvegarde': return <HardDrive size={16} />;
      case 'securite': return <Lock size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const v1Categories = categories.filter((c) => c.isV1);
  const v2Categories = categories.filter((c) => !c.isV1);

  const articlesByCategory = (catId: string) => articles.filter((a) => a.frontmatter.category === catId);

  const getCategoryLabel = (cat: CategoryInfo) => {
    return t.categories[cat.id]?.label || cat.label;
  };

  const getCategoryDesc = (cat: CategoryInfo) => {
    return t.categories[cat.id]?.desc || cat.description;
  };

  return (
    <aside className={`kb-sidebar ${isOpen ? 'open' : ''}`}>
      {/* V1 Active Categories */}
      <div className="kb-sidebar-nav-group">
        <div className="kb-sidebar-group-title">{t.modulesTitle}</div>
        {v1Categories.map((cat) => {
          const catArticles = articlesByCategory(cat.id);
          const isCatSelected = selectedCategory === cat.id;

          return (
            <div key={cat.id} style={{ marginBottom: 2 }}>
              <div
                className={`kb-nav-item ${isCatSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
                title={getCategoryDesc(cat)}
              >
                <div className="kb-nav-item-icon-wrap">
                  {getCategoryIcon(cat.id)}
                  <span>{getCategoryLabel(cat)}</span>
                </div>
                <span className="kb-nav-item-badge">{catArticles.length}</span>
              </div>

              {/* Sub-articles when category selected */}
              {isCatSelected && catArticles.length > 0 && (
                <div style={{ marginInlineStart: 20, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {catArticles.map((art) => {
                    const isArtSelected = selectedArticleSlug === art.slug;
                    return (
                      <div
                        key={art.slug}
                        className={`kb-nav-item ${isArtSelected ? 'active' : ''}`}
                        style={{ fontSize: 12, padding: '5px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectArticle(art.slug);
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {art.frontmatter.title}
                        </span>
                        {isRTL ? (
                          <ChevronLeft size={12} style={{ opacity: isArtSelected ? 1 : 0.4 }} />
                        ) : (
                          <ChevronRight size={12} style={{ opacity: isArtSelected ? 1 : 0.4 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reserved Categories V2 (Placeholders) */}
      <div className="kb-sidebar-nav-group" style={{ marginTop: 8 }}>
        <div className="kb-sidebar-group-title">{t.infraTitle}</div>
        {v2Categories.map((cat) => {
          const isCatSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              className={`kb-nav-item placeholder ${isCatSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
              title={getCategoryDesc(cat)}
            >
              <div className="kb-nav-item-icon-wrap">
                {getCategoryIcon(cat.id)}
                <span>{getCategoryLabel(cat)}</span>
              </div>
              <span className="kb-nav-placeholder-tag">
                {cat.muraqibDocUrl ? 'Muraqib' : 'V2'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tag Filtering Bar */}
      {selectedTag && (
        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--kb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--kb-text-muted)' }}>
              <Tag size={12} />
              {t.activeFilter} <strong>#{selectedTag}</strong>
            </span>
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: 11 }}
            >
              {t.clearFilter}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
