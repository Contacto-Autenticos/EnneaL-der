import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mappings = {
  '/hub': '/',
  '/': '/eneagrama',
  '/test-intro': '/eneagrama-test-intro',
  '/test': '/eneagrama-test',
  '/result': '/eneagrama-result',
  '/initial-analysis': '/eneagrama-initial-analysis',
  '/test-liderazgo': '/eneagrama-empresas',
  '/advanced-intro': '/eneagrama-advanced-register',
  '/advanced-test': '/eneagrama-advanced-test',
  '/advanced-test-full': '/eneagrama-advanced-test-full',
  '/advanced-transition': '/eneagrama-advanced-transition',
  '/result-intro': '/eneagrama-result-intro',
  '/advanced-analysis-result': '/eneagrama-advanced-analysis-result',
  '/detailed-result': '/eneagrama-detailed-result',
  '/advanced-landing': '/eneagrama-advanced-test-landing',
  '/payment': '/eneagrama-payment',
  '/payment-status': '/eneagrama-payment-status',
  '/payment-success': '/eneagrama-payment-success',
  '/mp-status': '/eneagrama-mp-status'
};

const paramMappings = {
  '/result/': '/eneagrama-result/',
  '/advanced-analysis-result/': '/eneagrama-advanced-analysis-result/'
};

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles(path.join(__dirname, 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // We sort descending by length so '/advanced-test-full' is processed before '/advanced-test'
  const keys = Object.keys(mappings).sort((a, b) => b.length - a.length);

  keys.forEach(oldRoute => {
    const newRoute = mappings[oldRoute];
    
    // Safely replace in common routing attributes
    // path="/route"
    content = content.replace(new RegExp(`path=(['"])${oldRoute}\\1`, 'g'), `path=$1${newRoute}$1`);
    // to="/route"
    content = content.replace(new RegExp(`to=(['"])${oldRoute}\\1`, 'g'), `to=$1${newRoute}$1`);
    // navigate('/route') or navigate("/route") or navigate(`/route`)
    content = content.replace(new RegExp(`navigate\\((['"\`])${oldRoute}\\1`, 'g'), `navigate($1${newRoute}$1`);
    // window.location.href = "/route"
    content = content.replace(new RegExp(`window\\.location\\.href ?= ?(['"])${oldRoute}\\1`, 'g'), `window.location.href = $1${newRoute}$1`);
    // targetRoute="/route"
    content = content.replace(new RegExp(`targetRoute=(['"])${oldRoute}\\1`, 'g'), `targetRoute=$1${newRoute}$1`);
    // window.location.origin + '/route'
    content = content.replace(new RegExp(`window\\.location\\.origin \\+ (['"])${oldRoute}\\1`, 'g'), `window.location.origin + $1${newRoute}$1`);
  });

  // Parameterized exact replace for path prop (App.jsx)
  content = content.replace(/path=['"]\/result\/:type['"]/g, 'path="/eneagrama-result/:type"');
  content = content.replace(/path=['"]\/advanced-analysis-result\/:type['"]/g, 'path="/eneagrama-advanced-analysis-result/:type"');

  // Prefix replace for template literals like `/result/${type}`
  Object.keys(paramMappings).forEach(oldPrefix => {
    const newPrefix = paramMappings[oldPrefix];
    // ONLY replace if it's inside backticks or quotes, preceded by origin or navigate
    content = content.replace(new RegExp(`navigate\\((['"\`])${oldPrefix}`, 'g'), `navigate($1${newPrefix}`);
    content = content.replace(new RegExp(`window\\.location\\.origin \\+ (['"\`])${oldPrefix}`, 'g'), `window.location.origin + $1${newPrefix}`);
    content = content.replace(new RegExp(`to=(['"\`])${oldPrefix}`, 'g'), `to=$1${newPrefix}`);
    content = content.replace(new RegExp(`window\\.location\\.href ?= ?(['"\`])${oldPrefix}`, 'g'), `window.location.href = $1${newPrefix}`);
  });

  // Special Edge Case in App.jsx:
  // if (testResult) { window.location.href = "/"; } -> window.location.href = "/eneagrama";
  if (file.endsWith('App.jsx')) {
      content = content.replace(/window\.location\.href = "\/";/g, 'window.location.href = "/eneagrama";');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Migración completada con éxito.');
