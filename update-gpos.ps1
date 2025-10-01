# GPOS System Update Script
# This script kills the GPOS process, pulls latest code, builds, and creates desktop shortcut

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GPOS System Update Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill GPOS System processes
Write-Host "Step 1: Stopping GPOS System processes..." -ForegroundColor Yellow
try {
    # Kill "GPOS System.exe" process
    $gposProcess = Get-Process -Name "GPOS System" -ErrorAction SilentlyContinue
    if ($gposProcess) {
        Stop-Process -Name "GPOS System" -Force
        Write-Host "✓ Stopped GPOS System process" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "✓ GPOS System process not running" -ForegroundColor Green
    }

    # Also kill any electron processes related to GPOS
    $electronProcesses = Get-Process -Name "electron" -ErrorAction SilentlyContinue
    if ($electronProcesses) {
        Stop-Process -Name "electron" -Force
        Write-Host "✓ Stopped Electron processes" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "✓ No Electron processes running" -ForegroundColor Green
    }
} catch {
    Write-Host "! Error stopping processes: $_" -ForegroundColor Red
}

Write-Host ""

# Step 2: Git reset --hard HEAD
Write-Host "Step 2: Resetting git repository..." -ForegroundColor Yellow
try {
    git reset --hard HEAD
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git reset successful" -ForegroundColor Green
    } else {
        Write-Host "! Git reset failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "! Error during git reset: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Git pull
Write-Host "Step 3: Pulling latest code from repository..." -ForegroundColor Yellow
try {
    git pull
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git pull successful" -ForegroundColor Green
    } else {
        Write-Host "! Git pull failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "! Error during git pull: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Build the installer
Write-Host "Step 4: Building GPOS installer..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray
try {
    npm run build:win-installer
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build successful" -ForegroundColor Green
    } else {
        Write-Host "! Build failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "! Error during build: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Delete old desktop shortcut if exists
Write-Host "Step 5: Cleaning up old desktop shortcut..." -ForegroundColor Yellow
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "GPOS System.lnk"

if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    Write-Host "✓ Deleted old desktop shortcut" -ForegroundColor Green
} else {
    Write-Host "✓ No old shortcut found" -ForegroundColor Green
}

Write-Host ""

# Step 6: Create new shortcut and copy to desktop
Write-Host "Step 6: Creating new desktop shortcut..." -ForegroundColor Yellow
try {
    # Get the current script location to build the exe path
    $scriptPath = $PSScriptRoot
    $exePath = Join-Path $scriptPath "dist\win-unpacked\GPOS System.exe"
    
    # Verify exe exists
    if (-not (Test-Path $exePath)) {
        Write-Host "! Error: GPOS System.exe not found at: $exePath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Found exe at: $exePath" -ForegroundColor Gray
    
    # Create shortcut using WScript.Shell COM object
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $exePath
    $Shortcut.WorkingDirectory = Split-Path $exePath
    $Shortcut.Description = "GPOS System - Point of Sale Application"
    $Shortcut.Save()
    
    Write-Host "✓ Created desktop shortcut successfully" -ForegroundColor Green
    Write-Host "Shortcut location: $shortcutPath" -ForegroundColor Gray
} catch {
    Write-Host "! Error creating shortcut: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now launch GPOS System from the desktop shortcut." -ForegroundColor White
Write-Host ""

