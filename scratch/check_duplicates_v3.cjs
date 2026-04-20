
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'data', 'fascinantesData.js');
const content = fs.readFileSync(filePath, 'utf-8');

const regex = /text:\s*'([^']+)'/g;
let match;
const normalizedTexts = [];
const originalTexts = [];

while ((match = regex.exec(content)) !== null) {
    const text = match[1];
    originalTexts.push(text);
    // Normalizar: minúsculas, sin espacios extra, sin puntos finales
    normalizedTexts.push(text.toLowerCase().trim().replace(/\.$/, ''));
}

const counts = {};
const duplicates = [];

normalizedTexts.forEach((text, index) => {
    counts[text] = (counts[text] || 0) + 1;
    if (counts[text] === 2) {
        duplicates.push({ text: originalTexts[index], normalized: text });
    }
});

if (duplicates.length > 0) {
    console.log("Se encontraron preguntas muy similares o repetidas (ignorando mayúsculas y puntos finales):");
    duplicates.forEach(d => console.log(`- "${d.text}"`));
} else {
    console.log("No se encontraron preguntas similares o repetidas en los 6 dominios.");
}
