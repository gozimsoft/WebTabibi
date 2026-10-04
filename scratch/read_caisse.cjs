const fs = require('fs');
const content = fs.readFileSync('D:/Github/Utopia_react/frontend/src/components/LaCaisseWindow.jsx', 'utf8');
const lines = content.split('\n');
console.log("Total lines:", lines.length);
lines.forEach((line, idx) => {
  if (line.includes('Total HT') || line.includes('totalTTC') || line.includes('totalHT') || line.includes('bg-slate-900') || line.includes('bg-[#111425]')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
