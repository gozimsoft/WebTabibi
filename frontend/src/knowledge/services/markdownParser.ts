import { ArticleFrontmatter } from '../types/article';

export function parseFrontmatter(rawContent: string): { frontmatter: ArticleFrontmatter; body: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = rawContent.match(frontmatterRegex);

  const defaultMeta: ArticleFrontmatter = {
    id: 'unknown',
    title: 'Sans titre',
    category: 'non-classe',
    tags: [],
    version: '1.0.0',
    tabibi_version: '>=2.4.0',
    status: 'A_VERIFIER',
    last_validated: new Date().toISOString().split('T')[0],
    author: 'Support Team',
    reviewer: 'Stellarsoft Team',
    level_support: ['L1'],
    target_audience: ['support']
  };

  if (!match) {
    return { frontmatter: defaultMeta, body: rawContent.trim() };
  }

  const yamlBlock = match[1];
  const body = match[2];
  const parsedMeta: any = { ...defaultMeta };

  const lines = yamlBlock.split(/\r?\n/);
  let currentKey: string | null = null;
  let isMultiLineArray = false;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Multi-line array item (e.g. - "something")
    if (isMultiLineArray && trimmed.startsWith('-')) {
      const val = trimmed.replace(/^-\s*/, '').replace(/^['"](.*)['"]$/, '$1').trim();
      if (currentKey && Array.isArray(parsedMeta[currentKey])) {
        parsedMeta[currentKey].push(val);
      }
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      let value = line.substring(colonIdx + 1).trim();

      // Check inline comment
      const hashIdx = value.indexOf('#');
      if (hashIdx !== -1 && !value.startsWith('"') && !value.startsWith("'")) {
        value = value.substring(0, hashIdx).trim();
      }

      currentKey = key;

      if (!value) {
        // Next lines might be an array
        isMultiLineArray = true;
        parsedMeta[key] = [];
        continue;
      }

      isMultiLineArray = false;

      // Inline array: [a, b, c]
      if (value.startsWith('[') && value.endsWith(']')) {
        const rawItems = value.slice(1, -1).split(',');
        parsedMeta[key] = rawItems
          .map((item) => item.trim().replace(/^['"](.*)['"]$/, '$1'))
          .filter(Boolean);
      } else if (value.toLowerCase() === 'true') {
        parsedMeta[key] = true;
      } else if (value.toLowerCase() === 'false') {
        parsedMeta[key] = false;
      } else if (value.toLowerCase() === 'null') {
        parsedMeta[key] = null;
      } else {
        // Strip quotes
        parsedMeta[key] = value.replace(/^['"](.*)['"]$/, '$1');
      }
    }
  }

  return { frontmatter: parsedMeta as ArticleFrontmatter, body: body.trim() };
}

export function renderMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape raw HTML tags slightly for safety
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Restore blockquote tag
  html = html.replace(/^&gt;\s?(.*)$/gm, '<blockquote>$1</blockquote>');
  // Combine consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Format callouts with emojis inside blockquotes
  html = html.replace(/<blockquote>📞\s*\*\*([^*]+)\*\*:?([\s\S]*?)<\/blockquote>/g, 
    '<div class="kb-callout kb-callout-phone"><div class="kb-callout-header"><span class="kb-callout-icon">📞</span><strong>$1</strong></div><div class="kb-callout-body">$2</div></div>');
  html = html.replace(/<blockquote>🔗\s*([\s\S]*?)<\/blockquote>/g, 
    '<div class="kb-callout kb-callout-link"><span class="kb-callout-icon">🔗</span><div>$1</div></div>');
  html = html.replace(/<blockquote>⚠️\s*([\s\S]*?)<\/blockquote>/g, 
    '<div class="kb-callout kb-callout-warn"><span class="kb-callout-icon">⚠️</span><div>$1</div></div>');

  // Code blocks ```code```
  html = html.replace(/```([a-z0-9_-]*)\r?\n([\s\S]*?)\r?\n```/g, (_match, _lang, code) => {
    return `<pre class="kb-code-block"><code>${code.trim()}</code></pre>`;
  });

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="kb-inline-code">$1</code>');

  // Headings
  html = html.replace(/^#### (.*$)/gim, '<h4 class="kb-h4">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="kb-h3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="kb-h2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="kb-h1">$1</h1>');

  // Bold & Italics
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Checkbox lists
  html = html.replace(/^- \[ \] (.*)$/gim, '<li class="kb-task-item"><span class="kb-checkbox">☐</span> $1</li>');
  html = html.replace(/^- \[x\] (.*)$/gim, '<li class="kb-task-item checked"><span class="kb-checkbox">☑</span> $1</li>');

  // Regular Unordered list items
  html = html.replace(/^- (.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)/gm, '<ul class="kb-list">$1</ul>');
  // De-duplicate nested ULs
  html = html.replace(/<\/ul>\n<ul class="kb-list">/g, '\n');

  // Tables
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter((c) => c.trim().length > 0);
    // If separator row
    if (cells.every((c) => /^:?-+:?$/.test(c.trim()))) {
      return '<!-- separator -->';
    }
    const row = cells.map((c) => `<td>${c.trim()}</td>`).join('');
    return `<tr>${row}</tr>`;
  });

  // Wrap table rows
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)/gm, (match) => {
    // If it has separator
    const cleanMatch = match.replace(/<!-- separator -->\n?/g, '');
    return `<div class="kb-table-wrap"><table class="kb-table">${cleanMatch}</table></div>`;
  });
  html = html.replace(/<\/table><\/div>\n<div class="kb-table-wrap"><table class="kb-table">/g, '\n');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="kb-link" target="_blank" rel="noopener noreferrer">$1</a>');

  // Paragraphs
  html = html.split(/\n{2,}/).map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<div') || trimmed.startsWith('<ul') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<pre')) {
      return trimmed;
    }
    return `<p class="kb-p">${trimmed}</p>`;
  }).join('\n\n');

  return html;
}
