const fs = require('fs');
const path = require('path');

const appContent = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// Find all cases in renderPage
const renderPageMatch = appContent.match(/const renderPage\s*=\s*\(\)\s*=>\s*{([\s\S]*?)return\s*\(/);
if (renderPageMatch) {
  const switchBody = renderPageMatch[1];
  const caseMatches = [...switchBody.matchAll(/case\s+["']([^"']+)["']:/g)].map(m => m[1]);
  console.log('Routes in renderPage:', caseMatches);
} else {
  console.log('renderPage not matched in expected format, searching for cases directly');
  const directCases = [...appContent.matchAll(/case\s+["'](\/[^"']*)["']:/g)].map(m => m[1]);
  console.log('Direct cases:', directCases);
}
