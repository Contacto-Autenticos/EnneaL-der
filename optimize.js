import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const inPath = path.join(dir, file);
        if (fs.statSync(inPath).isDirectory()) continue;
        
        if (file.endsWith('.png') || file.endsWith('.jpg')) {
            console.log('Optimizing ' + inPath);
            const outPath = inPath + '.optimized' + path.extname(file);
            try {
                const s = sharp(inPath).resize({ width: 1400, withoutEnlargement: true });
                if (file.endsWith('.png')) {
                    await s.png({ quality: 80, palette: true, compressionLevel: 9 }).toFile(outPath);
                } else {
                    await s.jpeg({ quality: 80, mozjpeg: true }).toFile(outPath);
                }
                const oldStats = fs.statSync(inPath);
                const newStats = fs.statSync(outPath);
                fs.renameSync(outPath, inPath);
                console.log(`  -> Reduced from ${(oldStats.size/1024/1024).toFixed(2)}MB to ${(newStats.size/1024/1024).toFixed(2)}MB`);
            } catch (e) {
                console.error('Error optimizing ' + file, e);
            }
        }
    }
}

async function run() {
    await optimizeDir('public/mlt');
    await optimizeDir('public');
    console.log('Optimization complete!');
}

run();
