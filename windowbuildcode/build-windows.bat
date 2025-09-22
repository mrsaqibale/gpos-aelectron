@echo off
echo 🚀 Starting GPOS System Windows Build Process...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    echo Please install npm (comes with Node.js)
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

REM Run the Windows build script
echo 📦 Running Windows build script...
node build-app-windows.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Windows build completed successfully!
    echo 📁 Check the "dist" folder for your built application
    echo.
    echo 📦 You will find:
    echo    - GPOS System-Setup-{version}.exe (Installer)
    echo    - GPOS System-Portable-{version}.exe (Portable)
    echo    - win-unpacked/ folder (Unpacked application)
    echo.
) else (
    echo.
    echo ❌ Build failed! Check the error messages above.
    echo.
)

pause
