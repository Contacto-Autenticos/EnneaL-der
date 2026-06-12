import sharp from 'sharp';
import fs from 'fs';

async function run() {
    const inPath = 'public/Bombillo-2.gif';
    const outPath = 'public/Bombillo-2.webp';
    console.log('Optimizing GIF to WebP...');
    try {
        const oldStats = fs.statSync(inPath);
        await sharp(inPath, { animated: true, limitInputPixels: false })
            .resize({ width: 600, withoutEnlargement: true })
            .webp({ quality: 80, effort: 4 })
            .toFile(outPath);
        const newStats = fs.statSync(outPath);
        console.log(`Done! Reduced from ${(oldStats.size/1024/1024).toFixed(2)}MB to ${(newStats.size/1024/1024).toFixed(2)}MB`);
    } catch (e) {
        console.error(e);
    }
}
run();
