@echo off
echo ========================================
echo   LegalOps v1 - End of Session
echo ========================================
echo.

REM ============================================
REM STEP 1: 5-MINUTE RETROSPECTIVE (PDCA)
REM ============================================
echo ========================================
echo   📋 STEP 1: 5-MINUTE RETROSPECTIVE
echo ========================================
echo.
echo Please take 5 minutes to reflect on this session:
echo.
echo 1. What did we accomplish today?
echo 2. What went well?
echo 3. What could be improved?
echo 4. Any blockers or concerns?
echo 5. What should we focus on next session?
echo.
echo (Take your time - this helps us improve!)
echo.
pause
echo.

REM ============================================
REM STEP 2: COMPLETION CHECK
REM ============================================
echo ========================================
echo   ✅ STEP 2: COMPLETION CHECK
echo ========================================
echo.
echo Before we save, let's verify:
echo.
echo ✓ Are all tasks for this session complete?
echo ✓ Did we test the changes we made?
echo ✓ Is the code working as expected?
echo ✓ Any documentation needed?
echo ✓ Ready to commit these changes?
echo.
pause
echo.

REM ============================================
REM STEP 3: SAVE TO GITHUB
REM ============================================
echo ========================================
echo   💾 STEP 3: SAVING TO GITHUB
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
echo Great work today! See you next session! 🚀
echo.

pause

