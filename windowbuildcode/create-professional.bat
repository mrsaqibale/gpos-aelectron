@echo off
echo Creating GPOS System Professional Installer...
echo.

REM Kill any running instances
taskkill /f /im "GPOS System.exe" 2>nul
taskkill /f /im "GPOS System-Portable-0.0.0.exe" 2>nul

REM Clean previous professional builds
if exist "dist-professional" rmdir /s /q "dist-professional"

REM Run the professional installer creation
npm run create:professional

echo.
echo Professional installer creation completed!
echo Check the "dist-professional" folder for your professional installer.
echo.
echo Files created:
echo - GPOS System-Professional-Installer.exe (Professional installer)
echo - README.txt (Professional documentation)
echo - INSTALLATION_GUIDE.txt (Step-by-step guide)
echo.
pause

