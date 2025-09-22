const fs = require('fs');
const path = require('path');

module.exports = function afterAllArtifactBuild(context) {
  console.log('Running after-build script...');

// Copy database files to the correct location in the built app
const sourceDbPath = path.join(__dirname, '../src/database');
const targetDbPath = path.join(__dirname, '../dist/database');

if (fs.existsSync(sourceDbPath)) {
  if (!fs.existsSync(targetDbPath)) {
    fs.mkdirSync(targetDbPath, { recursive: true });
  }
  
  // Copy database files
  const dbFiles = ['pos.db', 'init.js'];
  dbFiles.forEach(file => {
    const sourceFile = path.join(sourceDbPath, file);
    const targetFile = path.join(targetDbPath, file);
    
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`Copied ${file} to build directory`);
    }
  });
  
  // Copy migrations directory
  const sourceMigrationsPath = path.join(sourceDbPath, 'migrations');
  const targetMigrationsPath = path.join(targetDbPath, 'migrations');
  
  if (fs.existsSync(sourceMigrationsPath)) {
    if (!fs.existsSync(targetMigrationsPath)) {
      fs.mkdirSync(targetMigrationsPath, { recursive: true });
    }
    
    const migrationFiles = fs.readdirSync(sourceMigrationsPath);
    migrationFiles.forEach(file => {
      const sourceFile = path.join(sourceMigrationsPath, file);
      const targetFile = path.join(targetMigrationsPath, file);
      fs.copyFileSync(sourceFile, targetFile);
    });
    console.log('Copied migrations directory to build directory');
  }
  
  // Copy models directory
  const sourceModelsPath = path.join(sourceDbPath, 'models');
  const targetModelsPath = path.join(targetDbPath, 'models');
  
  if (fs.existsSync(sourceModelsPath)) {
    if (!fs.existsSync(targetModelsPath)) {
      fs.mkdirSync(targetModelsPath, { recursive: true });
    }
    
    function copyDirectory(src, dest) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const items = fs.readdirSync(src);
      items.forEach(item => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        if (fs.statSync(srcPath).isDirectory()) {
          copyDirectory(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });
    }
    
    copyDirectory(sourceModelsPath, targetModelsPath);
    console.log('Copied models directory to build directory');
  }
}

console.log('After-build script completed successfully!');
}; 