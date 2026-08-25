const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

console.log('--- SCANNING SRC FOR CONSOLE.LOG & DEV HINTS ---');

walkDir(path.join(__dirname, '..', 'src'), (filePath) => {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.includes('console.log')) {
      console.log(`[console.log] ${path.relative(path.join(__dirname, '..'), filePath)}:${index + 1} -> ${line.trim()}`);
    }
    if (line.toLowerCase().includes('admin / adminpassword') || line.toLowerCase().includes('default admin')) {
      console.log(`[dev hint] ${path.relative(path.join(__dirname, '..'), filePath)}:${index + 1} -> ${line.trim()}`);
    }
    if (line.includes('Admin Login') || line.includes('Admin Portal')) {
      console.log(`[admin link] ${path.relative(path.join(__dirname, '..'), filePath)}:${index + 1} -> ${line.trim()}`);
    }
  });
});
