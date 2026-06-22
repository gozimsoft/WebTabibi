const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');
const eol = code.includes('\r\n') ? '\r\n' : '\n';

const lines = code.split(eol);

// Fix 5206
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>') && 
      lines[i-1].includes('    }')) {
    
    // We found the spot. We need to insert the missing lines before i.
    lines.splice(i, 0, '  };', '', '  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;', '', '  return (');
    console.log('Fixed broken chunk at line ' + i);
    break;
  }
}

code = lines.join(eol);

fs.writeFileSync('src/App.jsx', code, 'utf8');
