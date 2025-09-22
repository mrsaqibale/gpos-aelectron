const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Creating Professional GPOS System Installer...\n');

try {
  // Step 1: Build the working version first
  console.log('📦 Building the working version first...');
  execSync('npm run build:app-windows', { stdio: 'inherit' });
  console.log('✅ Working version built successfully\n');

  // Step 2: Create professional installer directory
  console.log('📁 Creating professional installer directory...');
  const professionalDir = 'dist-professional';
  if (fs.existsSync(professionalDir)) {
    fs.rmSync(professionalDir, { recursive: true, force: true });
  }
  fs.mkdirSync(professionalDir, { recursive: true });
  console.log('✅ Professional directory created\n');

  // Step 3: Copy the working installer
  console.log('📋 Copying working installer to professional directory...');
  const sourceInstaller = 'dist/GPOS System-Setup-0.0.0.exe';
  const targetInstaller = path.join(professionalDir, 'GPOS System-Professional-Installer.exe');
  
  if (fs.existsSync(sourceInstaller)) {
    fs.copyFileSync(sourceInstaller, targetInstaller);
    console.log('✅ Professional installer copied\n');
  } else {
    throw new Error('Source installer not found: ' + sourceInstaller);
  }

  // Step 4: Create professional documentation
  console.log('📝 Creating professional documentation...');
  const readmeContent = `# GPOS System - Professional Installer

## Installation Instructions

1. **Run the Installer**: Double-click on "GPOS System-Professional-Installer.exe"
2. **Accept Terms**: Read and accept the Terms & Conditions
3. **Choose Location**: Select installation directory (default: Program Files)
4. **Install**: Click Install to begin installation
5. **Complete**: Installation will create desktop shortcut and start menu entry

## Features

✅ **Professional Installation**: Full Windows installer with proper shortcuts
✅ **Terms & Conditions**: Legal agreement acceptance required
✅ **Desktop Shortcut**: Easy access from desktop
✅ **Start Menu Entry**: Available in Windows Start Menu
✅ **Uninstall Option**: Proper uninstall via Programs & Features
✅ **Database Management**: Database stored in user's AppData folder
✅ **Data Retention**: Option to keep data during uninstall

## Database Location

The application database is stored in:
\`\`\`
%APPDATA%\\GPOS System\\database\\
\`\`\`

## Uninstallation

1. Go to **Control Panel** > **Programs** > **Programs and Features**
2. Find "GPOS System" in the list
3. Click **Uninstall**
4. Choose whether to keep your data or remove everything

## Support

For support and updates, contact your system administrator.

---
GPOS System v1.0.0
Copyright © 2024 GPOS System. All rights reserved.
`;

  fs.writeFileSync(path.join(professionalDir, 'README.txt'), readmeContent);
  console.log('✅ Professional documentation created\n');

  // Step 5: Create installation guide
  const installGuide = `GPOS System Professional Installation Guide

STEP 1: INSTALLATION
- Double-click "GPOS System-Professional-Installer.exe"
- Follow the installation wizard
- Accept the Terms & Conditions
- Choose installation location
- Complete installation

STEP 2: FIRST RUN
- Launch GPOS System from desktop shortcut or start menu
- The application will automatically set up the database
- Database location: %APPDATA%\\GPOS System\\database\\

STEP 3: USING THE APPLICATION
- All your data is stored locally on your computer
- No internet connection required for basic operations
- Data is automatically backed up in your user profile

STEP 4: UNINSTALLATION (if needed)
- Go to Control Panel > Programs > Programs and Features
- Find "GPOS System" and click Uninstall
- Choose to keep or remove your data

For technical support, contact your system administrator.

---
This is a professional business application.
All data remains on your local computer for security.
`;

  fs.writeFileSync(path.join(professionalDir, 'INSTALLATION_GUIDE.txt'), installGuide);
  console.log('✅ Installation guide created\n');

  console.log('🎉 Professional GPOS System Installer Created Successfully!');
  console.log('📁 Check the "dist-professional" folder for your professional installer.');
  console.log('📦 You will find:');
  console.log('   - GPOS System-Professional-Installer.exe (Professional installer)');
  console.log('   - README.txt (Professional documentation)');
  console.log('   - INSTALLATION_GUIDE.txt (Step-by-step guide)');
  console.log('\n🎯 The professional installer includes:');
  console.log('   ✅ Professional Windows installer experience');
  console.log('   ✅ Terms & Conditions acceptance');
  console.log('   ✅ Custom installation directory selection');
  console.log('   ✅ Desktop shortcut creation');
  console.log('   ✅ Start menu entry');
  console.log('   ✅ Uninstall option in Programs and Features');
  console.log('   ✅ Database stored in user\'s AppData folder');
  console.log('   ✅ Professional documentation and guides');
  console.log('   ✅ Proper uninstall with data retention option');

} catch (error) {
  console.error('❌ Professional installer creation failed:', error.message);
  process.exit(1);
}

