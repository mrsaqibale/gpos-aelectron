@echo off
echo Testing GPOS Counter File...
echo.

set COUNTER_FILE=src\counter.html

echo Checking if counter file exists...
if exist "%COUNTER_FILE%" (
    echo ✅ Counter file found: %COUNTER_FILE%
    echo.
    echo Opening counter in default browser...
    start "" "%COUNTER_FILE%"
    echo ✅ Counter should now be open in your browser
) else (
    echo ❌ Counter file NOT found: %COUNTER_FILE%
    echo.
    echo Please make sure the file exists in the src folder
)

echo.
echo Press any key to exit...
pause > nul
