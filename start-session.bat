@echo off
echo ========================================
echo   LegalOps v1 - Complete Session Startup
echo   Automated Code Review + Dev Environment
echo ========================================
echo.

REM Navigate to project directory (in case you're not there)
cd /d "%~dp0"

echo ========================================
echo   STEP 1: GIT SYNC
echo ========================================
echo.

echo [1/3] Checking Git status...
git status
echo.

echo [2/3] Pulling latest changes from GitHub...
git pull origin main
echo.

echo [3/3] Recent commit history (last 5 commits):
git log --oneline -5
echo.

echo ========================================
echo   STEP 2: AUTOMATED CODE REVIEW
echo   (Senior Programmer Analysis)
echo ========================================
echo.

echo Running comprehensive code analysis...
echo This will check:
echo   - TypeScript type errors
echo   - ESLint code quality issues
echo   - Database schema validation
echo   - Security vulnerabilities
echo   - Dependency updates
echo.

cd legalops-platform
node scripts/code-review.js

echo.
echo ========================================
echo   STEP 3: OPENING VS CODE
echo ========================================
echo.

echo Opening Visual Studio Code...
start code .
timeout /t 3 /nobreak >nul
echo.

echo ========================================
echo   STEP 4: STARTING DEVELOPMENT SERVER
echo ========================================
echo.

echo Starting Qoder (Next.js with Turbopack)...
echo.
echo 🌐 Server will be available at: http://localhost:3000
echo 📄 Code review report: logs/SONNET_CODE_REVIEW.md
echo.
echo 💡 NEXT STEPS:
echo    1. Review logs/SONNET_CODE_REVIEW.md for issues
echo    2. Copy the report and paste into Sonnet 4.5
echo    3. Ask Sonnet to fix the critical issues
echo    4. Start coding!
echo.
echo Press Ctrl+C to stop the server when done.
echo.

npm run dev

