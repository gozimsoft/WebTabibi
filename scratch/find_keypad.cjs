const fs = require('fs');
const content = fs.readFileSync('D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Mise en attente') || line.includes('Encaiser') || line.includes('Encaisser') || line.includes('Imprimer le ticket')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
