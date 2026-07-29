@echo off
cd /d "%~dp0"

echo ============================================
echo   Step 1: Saving your data changes locally...
echo ============================================
echo.

git add data
git commit -m "data update"

echo.
echo ============================================
echo   Step 2: Pulling latest changes from GitHub...
echo ============================================
echo.

git pull

if errorlevel 1 (
    echo.
    echo ============================================
    echo   CONFLICT DETECTED.
    echo   Your work is safe and saved locally.
    echo   Do NOT push yet. Copy this window's text
    echo   and ask Claude for help resolving it.
    echo ============================================
    echo.
    pause
    exit /b
)

echo.
echo ============================================
echo   Step 3: Pushing to GitHub...
echo ============================================
echo.

git push

echo.
echo Done! The site will update in 1-2 minutes.
echo.
pause
