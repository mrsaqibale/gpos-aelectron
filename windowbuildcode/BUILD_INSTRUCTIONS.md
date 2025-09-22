# POS System - Build Instructions

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Windows 10/11 (for Windows builds)

## Quick Build

To build the application with all features (desktop icon, uninstall option, etc.):

```bash
# For Windows (with installer and portable versions)
npm run build:app-windows

# For Linux (recommended for current platform)
npm run build:app-linux

# Or use the automated build script
npm run build:app
```

This will:
1. Install all dependencies
2. Build the React app
3. Fix Electron paths for the target platform
4. Install electron-builder dependencies
5. Create platform-specific builds (Linux AppImage/Windows installer with portable version)

## Manual Build Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build React App
```bash
npm run build
```

### 3. Install Electron Builder Dependencies
```bash
npx electron-builder install-app-deps
```

### 4. Build Electron App

#### For Windows (Complete Build with Installer and Portable):
```bash
npm run build:app-windows
```

#### For Windows Installer Only (with desktop icon and uninstall):
```bash
npm run build:win-installer
```

#### For Windows Portable Version Only:
```bash
npm run build:win-portable
```

#### For Windows Both (Installer + Portable):
```bash
npm run build:win
```

#### For Linux:
```bash
npm run build:app-linux
```

## Build Output

After successful build, you'll find the following in the `dist` folder:

### Windows Build:
- `GPOS System-Setup-{version}.exe` - Windows installer with desktop shortcut and uninstall option
- `GPOS System-Portable-{version}.exe` - Portable version (no installation required)
- `win-unpacked/` - Unpacked application folder
- `database/` - Database files and models

### Linux Build:
- `linux-unpacked/pos-system` - Executable application
- `database/` - Database files and models

## Installation Features

The Windows installer includes:

✅ **Desktop Shortcut** - Creates a desktop icon automatically  
✅ **Start Menu Entry** - Adds to Windows Start Menu  
✅ **Uninstall Option** - Appears in "Programs and Features"  
✅ **Custom Installation Directory** - Users can choose where to install  
✅ **Registry Entries** - Proper Windows registry integration  
✅ **Application Data Directory** - Creates folders for database, logs, and config  
✅ **Portable Version** - No installation required, runs from any location  
✅ **Proper Icons** - Custom application icons throughout the system  
✅ **Data Preservation** - Option to keep user data during uninstall  

## Customization

### App Information
Edit `electron-builder-windows.json` (for Windows) or `electron-builder-linux.json` (for Linux) to change:
- App name and version
- Company information
- Icons
- Installation behavior
- Build targets and architecture

### Icons
Place your application icons in the `build/` folder:
- `icon.ico` - Main application icon
- `icon.png` - Alternative icon format

### NSIS Installer (Windows)
Customize the installer behavior by editing:
- `build/installer.nsh` - Custom installation/uninstallation scripts
- `electron-builder-windows.json` - NSIS configuration options

## Running the Application

### Development Mode
```bash
npm run dev
```

### Run Electron in Development
```bash
npm run electron
```

### Run Built Application

#### Windows:
```bash
# Run the installer
./dist/GPOS System-Setup-{version}.exe

# Or run portable version directly
./dist/GPOS System-Portable-{version}.exe

# Or run unpacked version
./dist/win-unpacked/GPOS System.exe
```

#### Linux:
```bash
# Using the launcher script
./run-app.sh

# Or directly
./dist/linux-unpacked/pos-system
```

### Start with Built App
```bash
npm start
```

## Troubleshooting

### Common Issues

1. **Build fails with "electron-builder not found"**
   ```bash
   npm install electron-builder --save-dev
   ```

2. **Database not found in production**
   - Ensure database files are copied to the build directory
   - Check the `scripts/after-build.js` script

3. **App shows white screen**
   - Check if the Vite dev server is running (development)
   - Verify the built files exist in `dist/` (production)

4. **Chrome sandbox error on Linux**
   - The build now includes `--no-sandbox` flags to prevent this issue
   - If you still get sandbox errors, run: `./dist/linux-unpacked/pos-system --no-sandbox`

5. **Module not found errors**
   - Fixed dynamic path resolution for database models
   - Works in both development and production builds

4. **Icons not showing**
   - Ensure icon files exist in `build/` folder
   - Use `.ico` format for Windows

### Build Logs
Check the console output for detailed error messages. The build process will show each step and any errors that occur.

## Distribution

### Windows
- **Installer Version**: Use the `GPOS System-Setup-{version}.exe` for standard distribution
  - The installer handles all dependencies and setup
  - Users can uninstall through Windows "Programs and Features"
  - Creates proper desktop shortcuts and start menu entries
- **Portable Version**: Use the `GPOS System-Portable-{version}.exe` for systems without admin rights
  - No installation required
  - Can be run from USB drives
  - Perfect for temporary installations or restricted environments

### Linux
- Use the AppImage for universal Linux distribution
- No installation required, just make executable and run

## Windows Build Features

The Windows build includes several enhancements for better user experience:

### Installer Features:
- **NSIS Installer**: Professional Windows installer with custom branding
- **Desktop Shortcut**: Automatically creates desktop icon with proper icon
- **Start Menu Integration**: Adds application to Windows Start Menu
- **Uninstall Support**: Proper uninstaller that removes all components
- **Registry Integration**: Proper Windows registry entries for system integration
- **Application Data Management**: Creates and manages application data directories
- **Custom Installation Directory**: Users can choose installation location

### Portable Version Features:
- **No Installation Required**: Runs directly from any location
- **USB Compatible**: Can be run from USB drives or network locations
- **No Admin Rights Required**: Perfect for restricted environments
- **Self-Contained**: All dependencies included in single executable

## Linux Sandbox Fix

The application includes automatic sandbox disabling to prevent Chrome sandbox permission errors on Linux:

- Added `--no-sandbox` and `--disable-setuid-sandbox` flags
- Set `sandbox: false` in webPreferences
- This ensures the app runs without requiring root permissions

## Updates

To create updates:
1. Increment the version in `package.json`
2. Run the build process again
3. Distribute the new installer

The installer will handle updates automatically, preserving user data. 