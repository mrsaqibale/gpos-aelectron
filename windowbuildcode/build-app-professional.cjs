const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting GPOS System Professional Installer Build...\n');

try {
  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');

  // Step 2: Build React app
  console.log('🔨 Building React app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ React app built successfully\n');

  // Step 3: Fix Electron paths
  console.log('🔧 Fixing Electron paths for Windows...');
  execSync('node scripts/fix-electron-paths.cjs', { stdio: 'inherit' });
  console.log('✅ Electron paths fixed successfully\n');

  // Step 4: Install electron-builder dependencies
  console.log('⚡ Installing electron-builder dependencies...');
  execSync('npx electron-builder install-app-deps', { stdio: 'inherit' });
  console.log('✅ Electron-builder dependencies installed\n');

  // Step 5: Build professional installer
  console.log('🪟 Building Professional Windows Installer...');
  execSync('npx electron-builder --config electron-builder-professional.json --win', { stdio: 'inherit' });
  console.log('✅ Professional installer built successfully\n');

  // Step 6: Run database setup script
  console.log('🗄️ Setting up database for professional installer...');
  execSync('node scripts/fix-database-paths.cjs', { stdio: 'inherit' });
  console.log('✅ Database setup completed\n');

  console.log('🎉 Professional Windows Installer Build Completed Successfully!');
  console.log('📁 Check the "dist-professional" folder for your professional installer.');
  console.log('📦 You will find:');
  console.log('   - Professional .exe installer file (with Terms & Conditions)');
  console.log('   - Desktop shortcut creation');
  console.log('   - Start menu entry');
  console.log('   - Uninstall option in Programs and Features');
  console.log('   - Database stored in user\'s AppData folder');
  console.log('   - Professional installation experience');
  console.log('\n🎯 The installer includes:');
  console.log('   ✅ Terms & Conditions acceptance');
  console.log('   ✅ Custom installation directory selection');
  console.log('   ✅ Desktop shortcut creation');
  console.log('   ✅ Start menu entry');
  console.log('   ✅ Uninstall option in Programs and Features');
  console.log('   ✅ Database stored in user\'s AppData folder');
  console.log('   ✅ Professional Windows registry integration');
  console.log('   ✅ Proper uninstall with data retention option');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
