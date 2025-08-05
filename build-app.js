import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting POS System build process...\n');

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
  
  // Step 4: Detect platform and build accordingly
  const platform = process.platform;
  console.log(`\n🖥️ Building Electron app for ${platform}...`);
  
  if (platform === 'win32') {
    execSync('npx electron-builder --win', { stdio: 'inherit' });
    console.log('\n✅ Windows build completed successfully!');
    console.log('📁 Check the "dist" folder for your Windows installer.');
  } else if (platform === 'linux') {
    execSync('npx electron-builder --linux', { stdio: 'inherit' });
    console.log('\n✅ Linux build completed successfully!');
    console.log('📁 Check the "dist" folder for your Linux packages.');
  } else if (platform === 'darwin') {
    execSync('npx electron-builder --mac', { stdio: 'inherit' });
    console.log('\n✅ macOS build completed successfully!');
    console.log('📁 Check the "dist" folder for your macOS app.');
  } else {
    console.log(`\n⚠️ Platform ${platform} not specifically supported, trying generic build...`);
    execSync('npx electron-builder', { stdio: 'inherit' });
  }
  
  console.log('\n✅ Build completed successfully!');
  console.log('📁 Check the "dist" folder for your built application.');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
} 