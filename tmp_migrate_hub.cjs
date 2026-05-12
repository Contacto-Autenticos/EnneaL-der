const fs = require('fs');
const path = require('path');

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

  // We are looking to replace exactly:
  // navigate('/') -> navigate('/hub')
  // window.location.href = '/' -> window.location.href = '/hub'
  // to="/" -> to="/hub"

  content = content.replace(/navigate\(['"`]\/['"`]\)/g, "navigate('/hub')");
  content = content.replace(/window\.location\.href ?= ?['"]\/['"]/g, 'window.location.href = "/hub"');
  
  // Replace EXACTLY to="/" not to="/something"
  content = content.replace(/to=['"]\/['"]/g, 'to="/hub"');

  if (content !== originalContent && !file.endsWith('App.jsx') && !file.endsWith('Gateway.jsx')) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Hub route migration complete.');
