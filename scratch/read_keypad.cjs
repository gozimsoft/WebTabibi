const fs = require('fs');
const content = fs.readFileSync('D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(470, 540).map((l, i) => `${i + 471}: ${l}`).join('\n'));
