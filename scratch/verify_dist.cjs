const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../frontend/dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('ERROR: dist/index.html does not exist!');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const regex = /(?:src|href)=["']([^"']+)["']/g;
let match;
const refs = [];
while ((match = regex.exec(indexHtml)) !== null) {
  const target = match[1];
  if (!target.startsWith('http') && !target.startsWith('//') && !target.startsWith('data:')) {
    refs.push(target);
  }
}

console.log('--- Checking references in dist/index.html ---');
let missingCount = 0;
for (const ref of refs) {
  const cleanRef = ref.split('?')[0].replace(/^\.\//, '').replace(/^\//, '');
  const fullPath = path.join(distDir, cleanRef);
  const exists = fs.existsSync(fullPath);
  console.log(`- ${ref} -> ${exists ? 'OK (Found)' : 'FAIL (Missing: ' + fullPath + ')'}`);
  if (!exists) missingCount++;
}

console.log('\n--- Checking essential deployment files in dist ---');
const essentialFiles = [
  'index.html',
  '.htaccess',
  'manifest.json',
  'sw.js',
  'favicon.ico',
  'logo.png'
];

for (const f of essentialFiles) {
  const exists = fs.existsSync(path.join(distDir, f));
  console.log(`- ${f} -> ${exists ? 'OK (Present)' : 'FAIL (Missing)'}`);
  if (!exists) missingCount++;
}

console.log('\n--- Checking dist/assets contents ---');
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  console.log(`Assets count: ${files.length}`);
  files.forEach(f => {
    const stat = fs.statSync(path.join(assetsDir, f));
    console.log(`  * ${f} (${(stat.size / 1024).toFixed(2)} KB)`);
  });
} else {
  console.log('FAIL: dist/assets directory missing');
  missingCount++;
}

console.log('\n=============================================');
if (missingCount === 0) {
  console.log('RESULT: ALL DIST ASSETS AND FILES ARE VALID & READY FOR DEPLOYMENT!');
} else {
  console.log(`RESULT: ${missingCount} ISSUES FOUND.`);
}
