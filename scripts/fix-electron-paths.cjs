const fs = require('fs');
const path = require('path');

console.log('Fixing Electron paths in built files...');

// Fix index.html paths
const indexPath = path.join(__dirname, '../dist/index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Replace absolute paths with relative paths
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  content = content.replace(/href="\/vite\.svg"/g, 'href="./vite.svg"');
  
  fs.writeFileSync(indexPath, content);
  console.log('Fixed index.html paths');
}

// Fix any other HTML files
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  files.forEach(file => {
    if (file.endsWith('.html')) {
      const filePath = path.join(distDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace absolute paths with relative paths
      content = content.replace(/href="\/assets\//g, 'href="./assets/');
      content = content.replace(/src="\/assets\//g, 'src="./assets/');
      content = content.replace(/href="\/vite\.svg"/g, 'href="./vite.svg"');
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed paths in ${file}`);
    }
  });
}

console.log('Electron path fixing completed!');
