const fs = require('fs');
const content = fs.readFileSync('D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx', 'utf8');
const lines = content.split('\n');
console.log("--- 325-345 ---");
console.log(lines.slice(324, 345).map((l, i) => `${i + 325}: ${l}`).join('\n'));
console.log("--- 575-595 ---");
console.log(lines.slice(574, 595).map((l, i) => `${i + 575}: ${l}`).join('\n'));
