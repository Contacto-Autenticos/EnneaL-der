const fs = require('fs');
const file = 'src/pages/FascinantesResult.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the useCORS line and insert windowWidth after it
const targetLine = '                useCORS: true,';
const insertLines = `                windowWidth: 1000,
                width: 1000,`;

if (content.includes(targetLine)) {
    content = content.replace(targetLine, targetLine + '\n' + insertLines);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully patched windowWidth!');
} else {
    console.error('Could not find useCORS line!');
    process.exit(1);
}
