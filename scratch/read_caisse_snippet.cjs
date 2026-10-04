const fs = require('fs');
const content = fs.readFileSync('D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(295, 335).map((l, i) => `${i + 296}: ${l}`).join('\n'));
