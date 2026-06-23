const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImagePath = path.join(__dirname, 'public', 'Icono-Aplicación-autenticos.png');
const outputDir = path.join(__dirname, 'public', 'pwa-icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    // 192x192
    await sharp(inputImagePath)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outputDir, 'icon-192x192.png'));
    console.log('Created icon-192x192.png');

    // 512x512
    await sharp(inputImagePath)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outputDir, 'icon-512x512.png'));
    console.log('Created icon-512x512.png');
    
    // Apple touch icon 180x180
    await sharp(inputImagePath)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('Created apple-touch-icon.png');
    
    console.log('All icons generated successfully.');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
