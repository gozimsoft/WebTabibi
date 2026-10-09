import { Article, SearchResult } from '../types/article';

export function searchArticles(
  articles: Article[],
  query: string,
  selectedCategory?: string,
  selectedTag?: string
): SearchResult[] {
  const cleanQuery = query.trim().toLowerCase();

  return articles
    .filter((article) => {
      if (selectedCategory && article.frontmatter.category !== selectedCategory) {
        return false;
      }
      if (selectedTag && !article.frontmatter.tags.includes(selectedTag)) {
        return false;
      }
      return true;
    })
    .map((article) => {
      if (!cleanQuery) {
        return {
          article,
          matchScore: 1,
          matchedFields: ['title'] as SearchResult['matchedFields'],
          snippet: article.content.substring(0, 160) + '...'
        };
      }

      let score = 0;
      const matchedFields: SearchResult['matchedFields'] = [];
      const terms = cleanQuery.split(/\s+/).filter(Boolean);

      for (const term of terms) {
        // Title match
        if (article.frontmatter.title.toLowerCase().includes(term)) {
          score += 15;
          if (!matchedFields.includes('title')) matchedFields.push('title');
        }

        // Symptoms match (Doctor calls)
        if (article.frontmatter.symptoms_doctor) {
          const symptomMatch = article.frontmatter.symptoms_doctor.some((s) => s.toLowerCase().includes(term));
          if (symptomMatch) {
            score += 12;
            if (!matchedFields.includes('symptoms')) matchedFields.push('symptoms');
          }
        }

        // Keywords match
        if (article.frontmatter.keywords) {
          const kwMatch = article.frontmatter.keywords.some((k) => k.toLowerCase().includes(term));
          if (kwMatch) {
            score += 8;
            if (!matchedFields.includes('keywords')) matchedFields.push('keywords');
          }
        }

        // Tags match
        if (article.frontmatter.tags.some((t) => t.toLowerCase().includes(term))) {
          score += 6;
          if (!matchedFields.includes('tags')) matchedFields.push('tags');
        }

        // Body content match
        const contentLower = article.content.toLowerCase();
        const contentIdx = contentLower.indexOf(term);
        if (contentIdx !== -1) {
          score += 3;
          if (!matchedFields.includes('content')) matchedFields.push('content');
        }
      }

      // Generate context snippet
      let snippet = '';
      if (article.frontmatter.symptoms_doctor && matchedFields.includes('symptoms')) {
        const matchingSymptom = article.frontmatter.symptoms_doctor.find(s => s.toLowerCase().includes(cleanQuery));
        if (matchingSymptom) {
          snippet = `« ${matchingSymptom} »`;
        }
      }
      
      if (!snippet) {
        const idx = article.content.toLowerCase().indexOf(cleanQuery);
        if (idx !== -1) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(article.content.length, idx + cleanQuery.length + 80);
          snippet = (start > 0 ? '...' : '') + article.content.substring(start, end).replace(/\n/g, ' ') + '...';
        } else {
          snippet = article.content.substring(0, 140).replace(/\n/g, ' ') + '...';
        }
      }

      return {
        article,
        matchScore: score,
        matchedFields,
        snippet
      };
    })
    .filter((res) => !cleanQuery || res.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function getAllUniqueTags(articles: Article[]): string[] {
  const set = new Set<string>();
  for (const a of articles) {
    for (const tag of a.frontmatter.tags || []) {
      set.add(tag);
    }
  }
  return Array.from(set).sort();
}
