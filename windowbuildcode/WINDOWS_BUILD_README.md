# GPOS System - Windows Build Guide

## Quick Start

### Option 1: Using npm script (Recommended)
```bash
npm run build:app-windows
```

### Option 2: Using batch file (Windows only)
```bash
build-windows.bat
```

### Option 3: Using Node.js directly
```bash
node build-app-windows.js
```

## What You Get

After a successful build, you'll find these files in the `dist` folder:

### 🎯 Main Executables
- **`GPOS System-Setup-{version}.exe`** - Full Windows installer
  - Creates desktop shortcut
  - Adds to Start Menu
  - Includes uninstall option
  - Proper Windows registry integration

- **`GPOS System-Portable-{version}.exe`** - Portable version
  - No installation required
  - Runs from any location
  - Perfect for USB drives
  - No admin rights needed

### 📁 Additional Files
- **`win-unpacked/`** - Unpacked application folder
- **`database/`** - Database files and models

## Installation Features

### Full Installer (`GPOS System-Setup-{version}.exe`)
✅ **Desktop Shortcut** - Automatic desktop icon creation  
✅ **Start Menu Entry** - Adds to Windows Start Menu  
✅ **Uninstall Option** - Appears in "Programs and Features"  
✅ **Custom Installation Directory** - User can choose location  
✅ **Registry Integration** - Proper Windows system integration  
✅ **Application Data Management** - Creates data folders  
✅ **Custom Icons** - Professional application icons  

### Portable Version (`GPOS System-Portable-{version}.exe`)
✅ **No Installation** - Runs directly from any location  
✅ **USB Compatible** - Perfect for portable use  
✅ **No Admin Rights** - Works in restricted environments  
✅ **Self-Contained** - All dependencies included  

## Build Process

The Windows build process includes:

1. **Dependency Installation** - Installs all required packages
2. **React App Build** - Builds the frontend application
3. **Path Fixing** - Fixes Electron paths for Windows
4. **Electron Builder Setup** - Prepares electron-builder
5. **Windows Build** - Creates installer and portable versions

## Requirements

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Windows 10/11** (for Windows builds)
- **Administrator rights** (recommended for full installer features)

## Troubleshooting

### Common Issues

1. **"electron-builder not found"**
   ```bash
   npm install electron-builder --save-dev
   ```

2. **Build fails with permission errors**
   - Run Command Prompt as Administrator
   - Or use the portable version instead

3. **Database not found in production**
   - The build automatically copies database files
   - Check the `scripts/fix-database-paths.cjs` script

4. **Icons not showing**
   - Ensure `build/icon.ico` exists
   - Use proper .ico format for Windows

### Build Logs
Check the console output for detailed error messages. The build process shows each step and any errors.

## Distribution

### For End Users
- **Standard Installation**: Use `GPOS System-Setup-{version}.exe`
- **Portable Use**: Use `GPOS System-Portable-{version}.exe`

### For Developers
- **Testing**: Use `win-unpacked/GPOS System.exe`
- **Development**: Use `npm run dev` or `npm run electron`

## Customization

### App Information
Edit `electron-builder-windows.json` to change:
- App name and version
- Company information
- Icons and branding
- Installation behavior

### Installer Behavior
Edit `build/installer.nsh` to customize:
- Installation directory
- Shortcut creation
- Uninstall behavior
- Custom installation steps

## Support

If you encounter issues:
1. Check the build logs for error messages
2. Ensure all requirements are met
3. Try running as Administrator
4. Check that all dependencies are installed

---

**Happy Building! 🚀**
