@echo off
REM GPOS System Update Script - Batch Launcher
REM Double-click this file to update GPOS System

title GPOS System Updater

echo ========================================
echo GPOS System Update Script
echo ========================================
echo.
echo This will update your GPOS System to the latest version.
echo Press any key to continue or close this window to cancel...
pause > nul

echo.
echo Running update script...
echo.

REM Run PowerShell script with execution policy bypass
PowerShell.exe -ExecutionPolicy Bypass -File "%~dp0update-gpos.ps1"

echo.
echo ========================================
echo.
if %ERRORLEVEL% EQU 0 (
    echo Update completed successfully!
    echo You can now close this window.
) else (
    echo Update failed! Please check the errors above.
    echo Press any key to close...
    pause > nul
)

echo.
pause

