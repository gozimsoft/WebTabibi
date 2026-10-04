const fs = require('fs');
const content = fs.readFileSync('D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('w-') && (l.includes('320') || l.includes('80') || l.includes('keypad') || l.includes('RIGHT'))) {
    console.log(`${i+1}: ${l}`);
  }
});
