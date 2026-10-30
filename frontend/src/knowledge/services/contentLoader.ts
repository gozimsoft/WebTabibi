import { Article, ArticleLang, CategoryInfo } from '../types/article';
import { parseFrontmatter } from './markdownParser';

export const CATEGORIES_CONFIG: CategoryInfo[] = [
  // ── Sections Cliniques & Pratique Quotidienne (Sidebar TABIBI) ──
  {
    id: 'reception',
    label: "Accueil & Secrétariat",
    description: "Enregistrement patient, gestion de la salle d'attente, encaissement des honoraires et flux d'entrée.",
    isV1: true
  },
  {
    id: 'rendez-vous',
    label: "Planning & Rendez-vous",
    description: "Gestion des agendas par praticien, créneaux, rappels SMS, gestion des retards et prévention des conflits.",
    isV1: true
  },
  {
    id: 'patients',
    label: "Dossiers & Fiches Patients",
    description: "Identité civile, antécédents médicaux/chirurgicaux, allergies, constantes vitales et archivage sécurisé.",
    isV1: true
  },
  {
    id: 'consultations',
    label: "Consultation Clinique",
    description: "Déroulement de la séance, étapes d'examen, mise en pause et reprise (urgences), antécédents et clôture.",
    isV1: true
  },
  {
    id: 'prescriptions',
    label: "Prescriptions & Ordonnances",
    description: "Immuabilité médico-légale, posologies automatisées, impression sécurisée, duplicata et avenants.",
    isV1: true
  },
  {
    id: 'documents-medicaux',
    label: "Documents Médicaux & GED",
    description: "Numérisation directe (webcam/scanner), visionneuse plein cadre, zoom, rotation, annotations et comparaison 'C'.",
    isV1: true
  },
  {
    id: 'dicom',
    label: "Imagerie Médicale & DICOM (PACS)",
    description: "Visualiseur de séries radiologiques (TDM, IRM, RX), fenêtrage (WW/WL), coupes multi-axiales et mesures.",
    isV1: true
  },
  {
    id: 'dentaire',
    label: "Cabinet Dentaire & Odontogramme",
    description: "Schéma dentaire interactif FDI (11 à 48), quadrants, actes cliniques (composites, endo, couronnes) et devis.",
    isV1: true
  },
  {
    id: 'certificats-rapports',
    label: "Certificats & Lettres de Liaison",
    description: "Certificats d'aptitude, dispenses de sport, attestations de présence, courriers d'orientation confrère.",
    isV1: true
  },
  {
    id: 'medicaments',
    label: "Médicaments & Nomenclature DCI",
    description: "Base officielle des médicaments enregistrés en Algérie, DCI, interactions, posologies types et alertes.",
    isV1: true
  },
  {
    id: 'gestion',
    label: "Statistiques & Gestion du Cabinet",
    description: "Indicateurs d'activité, rapports financiers journaliers/mensuels, exports comptables et rôles utilisateurs.",
    isV1: true
  },
  {
    id: 'parametres',
    label: "Paramètres & Configuration",
    description: "Papier à en-tête, coordonnées, logos, imprimantes par défaut, gestion des licences et préférences visuelles.",
    isV1: true
  },
  // ── Outils Réflexe & Support ──
  {
    id: 'le-medecin-appelle',
    label: "Le Médecin Appelle (Urgences N1)",
    description: "Matrice réflexe de diagnostic rapide par téléphone : blocages fréquents, urgences patient et critères d'escalade.",
    isV1: true
  },
  {
    id: 'faq-medecins',
    label: "FAQ & Raccourcis Clavier",
    description: "Raccourcis rapides (F1, C, Échap, Ctrl+P), utilisation bilingue Français/Arabe (RTL) et astuces d'efficacité.",
    isV1: true
  },
  // ── Infrastructure & Déploiement (Muraqib) ──
  {
    id: 'installation',
    label: "Installation & Poste Client",
    description: "Prérequis Windows, package Electron, pilotes d'imprimantes et périphériques USB.",
    isV1: false,
    muraqibDocUrl: 'https://muraqib.stellarsoft.dz/docs/install/workstation'
  },
  {
    id: 'reseau-serveur',
    label: "Réseau Local & Serveur Cabinet",
    description: "Architecture LAN multi-postes, ports 5000/3306, IP statiques et basculement autonome.",
    isV1: false,
    muraqibDocUrl: 'https://muraqib.stellarsoft.dz/docs/infra/network'
  },
  {
    id: 'sauvegarde',
    label: "Sauvegardes & Restauration",
    description: "Sauvegardes automatisées quotidiennes, rétention 3-2-1 et reprise d'activité après sinistre.",
    isV1: false,
    muraqibDocUrl: 'https://muraqib.stellarsoft.dz/docs/infra/backups'
  },
  {
    id: 'securite',
    label: "Sécurité & Contrôle d'Accès (RBAC)",
    description: "Confidentialité médicale, matrice de permissions, chiffrement des données sensibles et sessions.",
    isV1: false,
    muraqibDocUrl: 'https://muraqib.stellarsoft.dz/docs/infra/security'
  }
];

export function loadAllArticles(): Article[] {
  const rawFiles = (import.meta as any).glob('../content/**/*.md', { query: '?raw', eager: true }) as Record<string, { default: string } | string>;
  
  const articles: Article[] = [];

  for (const [path, moduleContent] of Object.entries(rawFiles)) {
    const rawString = typeof moduleContent === 'string' ? moduleContent : moduleContent.default;
    const { frontmatter, body } = parseFrontmatter(rawString);

    // Determine language from extension: .ar.md, .en.md, or .md / .fr.md
    let lang: ArticleLang = 'fr';
    let slug = frontmatter.id || 'unknown';

    const filenameMatch = path.match(/\/([^/]+)$/);
    if (filenameMatch) {
      const fullFilename = filenameMatch[1];
      if (fullFilename.endsWith('.ar.md')) {
        lang = 'ar';
        slug = fullFilename.replace(/\.ar\.md$/, '');
      } else if (fullFilename.endsWith('.en.md')) {
        lang = 'en';
        slug = fullFilename.replace(/\.en\.md$/, '');
      } else if (fullFilename.endsWith('.fr.md')) {
        lang = 'fr';
        slug = fullFilename.replace(/\.fr\.md$/, '');
      } else if (fullFilename.endsWith('.md')) {
        lang = 'fr';
        slug = fullFilename.replace(/\.md$/, '');
      }
    }

    const wordCount = body.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    articles.push({
      slug,
      lang,
      frontmatter,
      content: body,
      filePath: path,
      readingTimeMinutes: readingTime
    });
  }

  return articles.sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

export function getArticlesForLanguage(allArticles: Article[], currentLang: ArticleLang): Article[] {
  // Collect all unique slugs
  const allSlugs = Array.from(new Set(allArticles.map((a) => a.slug)));

  return allSlugs
    .map((slug) => {
      // Find matching article for currentLang, fallback to 'fr'
      const match = allArticles.find((a) => a.slug === slug && a.lang === currentLang);
      if (match) return match;
      return allArticles.find((a) => a.slug === slug && a.lang === 'fr');
    })
    .filter((a): a is Article => Boolean(a))
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

export function getArticleBySlugAndLang(allArticles: Article[], slug: string, lang: ArticleLang): Article | undefined {
  return (
    allArticles.find((a) => a.slug === slug && a.lang === lang) ||
    allArticles.find((a) => a.slug === slug && a.lang === 'fr') ||
    allArticles.find((a) => a.slug === slug)
  );
}
