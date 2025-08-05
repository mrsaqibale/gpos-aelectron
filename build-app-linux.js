import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting POS System Linux build process...\n');

try {
  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Step 2: Build the React app
  console.log('\n🔨 Building React app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 3: Install electron-builder dependencies
  console.log('\n⚡ Installing electron-builder dependencies...');
  execSync('npx electron-builder install-app-deps', { stdio: 'inherit' });
  
  // Step 4: Build the Electron app for Linux
  console.log('\n🐧 Building Electron app for Linux...');
  execSync('npx electron-builder --linux', { stdio: 'inherit' });
  
  console.log('\n✅ Linux build completed successfully!');
  console.log('📁 Check the "dist" folder for your built Linux application.');
  console.log('📦 You will find:');
  console.log('   - .AppImage file (portable)');
  console.log('   - .deb file (Debian/Ubuntu package)');
  console.log('   - .rpm file (Red Hat/Fedora package)');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
} 