
const { fascinantesQuestions } = require('./src/data/fascinantesData.js');

const texts = fascinantesQuestions.map(q => q.text.trim());
const duplicates = texts.filter((text, index) => texts.indexOf(text) !== index);

if (duplicates.length > 0) {
    console.log("Se encontraron preguntas repetidas:");
    duplicates.forEach(d => console.log(`- ${d}`));
} else {
    console.log("No se encontraron preguntas repetidas en los 6 dominios.");
}
