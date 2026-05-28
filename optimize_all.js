import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = 'public';
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;
const MIN_SIZE_KB = 100; // Only optimize files > 100KB

// Directories already optimized or to skip
const SKIP_DIRS = ['Ejemplo resltado autodiagnostico', 'Videos', 'Videos Autodiagnostico', 'pdfs', 'Organizaciones', 'Reporte-Eneatipo-1', 'Ejemplo resultado test avanzado eneagrama'];
const SKIP_FILES = ['favicon.png', 'vite.svg'];

let totalOriginal = 0;
let totalNew = 0;
let filesProcessed = 0;

async function optimizeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;
    
    const basename = path.basename(filePath);
    if (SKIP_FILES.includes(basename)) return;

    const stats = fs.statSync(filePath);
    if (stats.size < MIN_SIZE_KB * 1024) return;

    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    try {
        const tempPath = filePath + '.tmp';
        let pipeline = sharp(filePath).resize({ width: MAX_WIDTH, withoutEnlargement: true });

        if (ext === '.jpg' || ext === '.jpeg') {
            pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true });
        } else if (ext === '.png') {
            pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 8 });
        }

        await pipeline.toFile(tempPath);
        
        const newStats = fs.statSync(tempPath);
        
        // Only replace if actually smaller
        if (newStats.size < stats.size) {
            fs.renameSync(tempPath, filePath);
            totalOriginal += stats.size;
            totalNew += newStats.size;
            filesProcessed++;
            console.log(`✓ ${basename}: ${sizeMB} MB → ${(newStats.size / (1024 * 1024)).toFixed(2)} MB`);
        } else {
            fs.unlinkSync(tempPath);
            console.log(`⊘ ${basename}: already optimal (${sizeMB} MB)`);
        }
    } catch (err) {
        console.error(`✗ Error: ${basename}: ${err.message}`);
        // Clean up temp file if exists
        const tempPath = filePath + '.tmp';
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
}

async function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.includes(entry.name)) {
                await walkDir(fullPath);
            } else {
                console.log(`⟳ Skipping directory: ${entry.name}`);
            }
        } else {
            await optimizeFile(fullPath);
        }
    }
}

console.log('═══════════════════════════════════════════');
console.log('  Optimización masiva de imágenes');
console.log('═══════════════════════════════════════════\n');

await walkDir(PUBLIC_DIR);

const savedMB = ((totalOriginal - totalNew) / (1024 * 1024)).toFixed(2);
console.log('\n═══════════════════════════════════════════');
console.log(`  Archivos optimizados: ${filesProcessed}`);
console.log(`  Espacio ahorrado: ${savedMB} MB`);
console.log(`  Original: ${(totalOriginal / (1024 * 1024)).toFixed(2)} MB`);
console.log(`  Nuevo: ${(totalNew / (1024 * 1024)).toFixed(2)} MB`);
console.log('═══════════════════════════════════════════');
