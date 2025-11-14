@echo off
echo ========================================
echo   LegalOps v1 - Start of Session
echo ========================================
echo.

REM Navigate to project directory (in case you're not there)
cd /d "%~dp0"

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Fetching latest changes from GitHub...
git fetch
echo.

echo [3/5] Checking if there are updates...
git status
echo.

echo [4/5] Recent commit history (last 5 commits):
git log --oneline -5
echo.

echo [5/5] Current branch information:
git branch -v
echo.

echo ========================================
echo   ✅ SESSION STARTED!
echo   Project: LegalOps v1
echo   Location: %CD%
echo ========================================
echo.

echo 💡 Pro Tips:
echo    - Development server will start automatically
echo    - Run '.\save-session.bat' at the end of your session
echo    - Use 'git pull' if there are updates from GitHub
echo.

REM Optional: Uncomment the line below to auto-open VS Code
REM code .

echo.
echo ========================================
echo   🚀 STARTING DEVELOPMENT SERVER
echo ========================================
echo.
echo Starting Qoder (Next.js with Turbopack)...
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server when done.
echo.

REM Navigate to legalops-platform directory and start dev server
cd legalops-platform
npm run dev

