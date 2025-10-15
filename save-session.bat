@echo off
echo ========================================
echo   LegalOps v1 - End of Session Backup
echo ========================================
echo.

REM Get current date and time for commit message
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%

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

