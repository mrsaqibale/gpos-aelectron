# GPOS System Update Instructions

## Quick Update

Simply **double-click** the `update-gpos.bat` file to update your GPOS System to the latest version.

## What the Update Script Does

The update script performs the following steps automatically:

1. **Stops Running Processes**
   - Kills any running "GPOS System" processes
   - Kills any Electron processes
   
2. **Resets Local Changes**
   - Runs `git reset --hard HEAD` to discard any local changes
   
3. **Pulls Latest Code**
   - Runs `git pull` to get the latest updates from the repository
   
4. **Builds the Application**
   - Runs `npm run build:win-installer` to build the latest version
   - This may take several minutes
   
5. **Updates Desktop Shortcut**
   - Deletes old GPOS System shortcut from desktop (if exists)
   - Creates new shortcut pointing to: `dist\win-unpacked\GPOS System.exe`
   - Places the shortcut on your desktop

## Files

- **update-gpos.bat** - Double-click this file to run the update
- **update-gpos.ps1** - The PowerShell script (runs automatically from .bat file)

## Requirements

- Git must be installed and accessible from command line
- Node.js and npm must be installed
- Internet connection for pulling updates

## Troubleshooting

### If the update fails:

1. Make sure GPOS System is completely closed
2. Check that you have internet connection
3. Verify Git and Node.js are installed:
   ```powershell
   git --version
   node --version
   npm --version
   ```

### If PowerShell execution policy error:

Right-click `update-gpos.bat` and select "Run as Administrator"

## Manual Update Steps

If the automatic script doesn't work, you can run these commands manually:

```powershell
# Stop GPOS System (close the application)

# Navigate to project directory
cd "C:\Users\DOCTOR\Documents\gpos\react\gpos-aelectron - Copy"

# Reset local changes
git reset --hard HEAD

# Pull latest code
git pull

# Build the application
npm run build:win-installer

# Launch from: dist\win-unpacked\GPOS System.exe
```

## Notes

- All local changes will be discarded when running the update
- The build process may take 5-10 minutes depending on your system
- A new desktop shortcut will be created automatically



