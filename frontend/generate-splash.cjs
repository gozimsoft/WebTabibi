const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, 'assets');
const logoPath = path.join(assetsDir, 'icon_backup.png'); // Use the original icon or logo. Let's use logo if it exists and is transparent, or icon. We'll use icon_backup as it's the original large icon.
const splashPath = path.join(assetsDir, 'splash.png');

const width = 2732;
const height = 2732;

// Medical icon paths from lucide (24x24 viewport)
const icons = {
  stethoscope: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  syringe: '<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>',
  microscope: '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>'
};

const scatteredIcons = [];
const cols = 8;
const rows = 8;
const cellW = width / cols;
const cellH = height / rows;

const iconKeys = Object.keys(icons);

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    // leave center empty for logo (middle 4x4 area in 8x8 grid)
    if (r >= 2 && r <= 5 && c >= 2 && c <= 5) continue;

    const key = iconKeys[Math.floor(Math.random() * iconKeys.length)];
    const x = c * cellW + cellW / 2 + (Math.random() * 200 - 100);
    const y = r * cellH + cellH / 2 + (Math.random() * 200 - 100);
    const scale = 5 + Math.random() * 5; 
    const rotate = Math.random() * 360;
    
    scatteredIcons.push(`
      <g transform="translate(${x}, ${y}) rotate(${rotate}) scale(${scale}) translate(-12, -12)">
        <g stroke="#0891b2" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.15">
          ${icons[key]}
        </g>
      </g>
    `);
  }
}

const svgBackground = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff" />
  ${scatteredIcons.join('\\n')}
</svg>
`;

async function generateSplash() {
  try {
    const bgBuffer = Buffer.from(svgBackground);
    
    // Check if we have the original icon or logo
    let centerImage = logoPath;
    if (!fs.existsSync(centerImage)) {
      centerImage = path.join(assetsDir, 'icon.png');
    }

    // Read and resize the center logo to a reasonable size for splash (e.g., 800px)
    const logoBuffer = await sharp(centerImage)
      .resize(800, 800, { fit: 'contain', background: { r:0, g:0, b:0, alpha:0 } })
      .toBuffer();

    await sharp(bgBuffer)
      .composite([
        { input: logoBuffer, gravity: 'center' }
      ])
      .png()
      .toFile(splashPath);

    console.log('Splash screen generated successfully at', splashPath);
  } catch (err) {
    console.error('Error generating splash:', err);
  }
}

generateSplash();
