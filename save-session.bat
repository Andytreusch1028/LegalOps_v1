@echo off
echo ========================================
echo   LegalOps v1 - End of Session Backup
echo ========================================
echo.

REM Get current date and time for commit message (PowerShell method - works on all Windows)
for /f "tokens=*" %%i in ('powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm'"') do set TIMESTAMP=%%i

echo [1/4] Checking Git status...
git status
echo.

echo [2/4] Staging all changes...
git add .
echo.

echo [3/4] Committing changes...
git commit -m "Session backup - %TIMESTAMP%"
echo.

echo [4/4] Pushing to GitHub...
git push
echo.

echo ========================================
echo   ✅ SESSION SAVED SUCCESSFULLY!
echo   All changes backed up to GitHub
echo   Timestamp: %TIMESTAMP%
echo ========================================
echo.

pause

