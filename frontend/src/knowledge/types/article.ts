export type ArticleStatus = 'VALIDE' | 'OBSOLETE' | 'A_VERIFIER';
export type SupportLevel = 'L1' | 'L2' | 'L3';
export type ArticleLang = 'fr' | 'ar' | 'en';

export interface ArticleFrontmatter {
  id: string;
  title: string;
  category: string;
  tags: string[];
  version: string;
  tabibi_version: string;
  status: ArticleStatus;
  last_validated: string;
  author: string;
  reviewer: string;
  level_support: SupportLevel[];
  target_audience: string[];
  symptoms_doctor?: string[];
  keywords?: string[];
  escalation_threshold?: string;
  muraqib_ref?: string | null;
}

export interface Article {
  slug: string;
  lang: ArticleLang;
  frontmatter: ArticleFrontmatter;
  content: string;
  filePath: string;
  readingTimeMinutes: number;
}

export interface CategoryInfo {
  id: string;
  label: string;
  description: string;
  isV1: boolean;
  muraqibDocUrl?: string;
}

export interface SearchResult {
  article: Article;
  matchScore: number;
  matchedFields: ('title' | 'tags' | 'keywords' | 'symptoms' | 'content')[];
  snippet: string;
}
