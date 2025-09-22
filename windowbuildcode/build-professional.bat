@echo off
echo Building GPOS System Professional Installer...
echo.

REM Kill any running instances
taskkill /f /im "GPOS System.exe" 2>nul
taskkill /f /im "GPOS System-Portable-0.0.0.exe" 2>nul

REM Clean previous builds
if exist "dist-professional" rmdir /s /q "dist-professional"

REM Run the professional build
npm run build:professional

echo.
echo Professional installer build completed!
echo Check the "dist-professional" folder for your installer.
echo.
pause

