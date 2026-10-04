const fs = require('fs');
const content = fs.readFileSync('D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(252, 325).map((l, i) => `${i + 253}: ${l}`).join('\n'));
