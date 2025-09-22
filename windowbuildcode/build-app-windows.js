import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting POS System Windows build process...\n');

try {
  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Step 2: Build the React app
  console.log('\n🔨 Building React app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 2.5: Fix Electron paths for Windows
  console.log('\n🔧 Fixing Electron paths for Windows...');
  execSync('node scripts/fix-electron-paths.cjs', { stdio: 'inherit' });
  
  // Step 3: Install electron-builder dependencies
  console.log('\n⚡ Installing electron-builder dependencies...');
  execSync('npx electron-builder install-app-deps', { stdio: 'inherit' });
  
  // Step 4: Build the Electron app for Windows
  console.log('\n🪟 Building Electron app for Windows...');
  execSync('npx electron-builder --config electron-builder-windows.json --win', { stdio: 'inherit' });
  
  console.log('\n✅ Windows build completed successfully!');
  console.log('📁 Check the "dist" folder for your built Windows application.');
  console.log('📦 You will find:');
  console.log('   - .exe installer file (with desktop shortcut and uninstall option)');
  console.log('   - Portable .exe file (no installation required)');
  console.log('   - win-unpacked/ folder (unpacked application)');
  console.log('\n🎯 The installer includes:');
  console.log('   ✅ Desktop shortcut creation');
  console.log('   ✅ Start menu entry');
  console.log('   ✅ Uninstall option in Programs and Features');
  console.log('   ✅ Custom installation directory selection');
  console.log('   ✅ Proper Windows registry integration');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
