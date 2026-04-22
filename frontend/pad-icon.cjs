const sharp = require('sharp');
const path = require('path');

const iconPath = path.join(__dirname, 'assets', 'icon.png');
const backupPath = path.join(__dirname, 'assets', 'icon_backup.png');

async function padIcon() {
  try {
    const metadata = await sharp(iconPath).metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    // Backup the original icon just in case
    await sharp(iconPath).toFile(backupPath);
    console.log('Original icon backed up to assets/icon_backup.png');

    // Create a new padded icon
    // Android safe zone is about 66% of the 108dp area.
    // We'll resize the icon to 65% of the total size.
    const newIconWidth = Math.floor(width * 0.65);
    const newIconHeight = Math.floor(height * 0.65);

    const resizedBuffer = await sharp(iconPath)
      .resize(newIconWidth, newIconHeight)
      .toBuffer();

    // Composite it onto a transparent background of the original size
    await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      }
    })
      .composite([{ input: resizedBuffer, gravity: 'center' }])
      .toFile(iconPath);

    console.log('Icon successfully padded!');
  } catch (err) {
    console.error('Error padding icon:', err);
  }
}

padIcon();
