@echo off
echo Starting Bank Customer Segmentation Application...

REM Start MongoDB
echo Starting MongoDB...
net start MongoDB >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Failed to start MongoDB. Make sure it's installed and try running as Administrator.
    echo You can download MongoDB from: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

REM Start backend server
echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

REM Give backend a moment to start
timeout /t 5 >nul

REM Start frontend server
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0 && npx http-server -p 3000"

REM Open browser
echo Opening application in default browser...
start http://localhost:3000

echo.
echo Application is starting...
echo If the browser doesn't open automatically, go to: http://localhost:3000
echo.
pause
