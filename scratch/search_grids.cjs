const fs = require('fs');
const app = fs.readFileSync('frontend/src/App.jsx', 'utf8');
const lines = app.split('\n');

lines.forEach((line, idx) => {
  if (line.includes("gridTemplateColumns") && line.includes("alignItems")) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
