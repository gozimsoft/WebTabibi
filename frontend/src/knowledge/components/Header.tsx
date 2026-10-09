import React from 'react';
import { Search, ShieldAlert, BookOpen, Menu, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onHomeClick: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onHomeClick,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="kb-header">
      <div className="kb-header-left">
        {onToggleSidebar && (
          <button
            type="button"
            className="kb-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Fermer le menu" : "Menu de navigation"}
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <div className="kb-brand-wrap" onClick={onHomeClick}>
          <div className="kb-brand-logo-wrap">
            <img
              src="/tabibi_logo.png"
              alt="Tabibi Logo"
              className="kb-brand-logo-img tabibi-flipping-logo"
            />
            <span className="kb-brand-lamp-badge" title="Manuel, Guide & Base de Connaissances TABIBI">
              <BookOpen size={11} className="kb-lamp-icon" strokeWidth={2.5} />
            </span>
          </div>
          <span className="kb-brand-title">{t.appName}</span>
          <span className="kb-brand-badge">{t.appBadge}</span>
        </div>
      </div>

      <div className="kb-header-actions">
        {/* Instant Search Trigger */}
        <button
          type="button"
          className="kb-search-trigger"
          onClick={onOpenSearch}
          title={`${t.searchTitle} (${t.searchShortcut})`}
        >
          <Search size={14} />
          <span>{t.searchPlaceholder.substring(0, 32)}...</span>
          <kbd className="kb-search-shortcut">{t.searchShortcut}</kbd>
        </button>

        {/* Multi-lingual Language Selector (FR, AR, EN) */}
        <div className="kb-lang-group" title="Changer de langue / تغيير اللغة / Change language">
          <button
            type="button"
            className={`kb-lang-btn ${language === 'fr' ? 'active' : ''}`}
            onClick={() => setLanguage('fr')}
          >
            FR
          </button>
          <button
            type="button"
            className={`kb-lang-btn ${language === 'ar' ? 'active' : ''}`}
            onClick={() => setLanguage('ar')}
          >
            عربي
          </button>
          <button
            type="button"
            className={`kb-lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>

        {/* Purely Informational Internal Zone Badge */}
        <div className="kb-internal-pill" title="Documentation interne réservée à l'équipe Stellarsoft & Support">
          <ShieldAlert size={14} />
          <span>{t.internalZone}</span>
        </div>
      </div>
    </header>
  );
};
