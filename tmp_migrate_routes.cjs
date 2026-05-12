const fs = require('fs');
const path = require('path');

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

  // We sort descending by length to avoid partial matches
  const keys = Object.keys(mappings).sort((a, b) => b.length - a.length);

  // PASS 1: Replace with intermediate placeholder
  keys.forEach((oldRoute, index) => {
    const placeholder = `__TMP_PLACEHOLDER_${index}__`;
    
    // Safely replace in common routing attributes
    content = content.replace(new RegExp(`path=(['"])${oldRoute}\\1`, 'g'), `path=$1${placeholder}$1`);
    content = content.replace(new RegExp(`to=(['"])${oldRoute}\\1`, 'g'), `to=$1${placeholder}$1`);
    content = content.replace(new RegExp(`navigate\\((['"\`])${oldRoute}\\1`, 'g'), `navigate($1${placeholder}$1`);
    content = content.replace(new RegExp(`window\\.location\\.href ?= ?(['"])${oldRoute}\\1`, 'g'), `window.location.href = $1${placeholder}$1`);
    content = content.replace(new RegExp(`targetRoute=(['"])${oldRoute}\\1`, 'g'), `targetRoute=$1${placeholder}$1`);
    content = content.replace(new RegExp(`window\\.location\\.origin \\+ (['"])${oldRoute}\\1`, 'g'), `window.location.origin + $1${placeholder}$1`);
  });

  // Parameterized exact replace for path prop (App.jsx)
  content = content.replace(/path=['"]\/result\/:type['"]/g, 'path="__TMP_PARAM_1__"');
  content = content.replace(/path=['"]\/advanced-analysis-result\/:type['"]/g, 'path="__TMP_PARAM_2__"');

  // Prefix replace for template literals
  Object.keys(paramMappings).forEach((oldPrefix, index) => {
    const placeholder = `__TMP_PREFIX_${index}__`;
    content = content.replace(new RegExp(`navigate\\((['"\`])${oldPrefix}`, 'g'), `navigate($1${placeholder}`);
    content = content.replace(new RegExp(`window\\.location\\.origin \\+ (['"\`])${oldPrefix}`, 'g'), `window.location.origin + $1${placeholder}`);
    content = content.replace(new RegExp(`to=(['"\`])${oldPrefix}`, 'g'), `to=$1${placeholder}`);
    content = content.replace(new RegExp(`window\\.location\\.href ?= ?(['"\`])${oldPrefix}`, 'g'), `window.location.href = $1${placeholder}`);
  });

  if (file.endsWith('App.jsx')) {
      content = content.replace(/window\.location\.href = "\/";/g, 'window.location.href = "__TMP_EDGE_1__";');
  }

  // PASS 2: Replace intermediate placeholders with the final values
  keys.forEach((oldRoute, index) => {
    const placeholder = `__TMP_PLACEHOLDER_${index}__`;
    const newRoute = mappings[oldRoute];
    content = content.replace(new RegExp(placeholder, 'g'), newRoute);
  });

  content = content.replace(/__TMP_PARAM_1__/g, '/eneagrama-result/:type');
  content = content.replace(/__TMP_PARAM_2__/g, '/eneagrama-advanced-analysis-result/:type');

  Object.keys(paramMappings).forEach((oldPrefix, index) => {
    const placeholder = `__TMP_PREFIX_${index}__`;
    const newPrefix = paramMappings[oldPrefix];
    content = content.replace(new RegExp(placeholder, 'g'), newPrefix);
  });

  content = content.replace(/__TMP_EDGE_1__/g, '/eneagrama');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Migración completada de forma segura.');
