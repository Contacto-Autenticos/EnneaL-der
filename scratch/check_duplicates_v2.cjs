
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'data', 'fascinantesData.js');
const content = fs.readFileSync(filePath, 'utf-8');

// Extraer los textos de las preguntas usando una expresión regular
const regex = /text:\s*'([^']+)'/g;
let match;
const texts = [];

while ((match = regex.exec(content)) !== null) {
    texts.push(match[1].trim());
}

const counts = {};
const duplicates = [];

texts.forEach(text => {
    counts[text] = (counts[text] || 0) + 1;
    if (counts[text] === 2) {
        duplicates.push(text);
    }
});

console.log(`Total de preguntas encontradas: ${texts.length}`);

if (duplicates.length > 0) {
    console.log("\nSe encontraron preguntas repetidas:");
    duplicates.forEach(d => console.log(`- ${d} (Aparece ${counts[d]} veces)`));
} else {
    console.log("\nNo se encontraron preguntas repetidas en los 6 dominios.");
}
