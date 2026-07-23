@echo off
cd /d "%~dp0"

echo ============================================
echo   Pushing ALL changes to GitHub...
echo   (design, code, and data)
echo ============================================
echo.

git add .
git commit -m "site update"

if errorlevel 1 (
    echo.
    echo Nothing changed. No new files to push.
) else (
    echo.
    echo Pushing to GitHub...
    git push
    echo.
    echo Done! The site will update in 1-2 minutes.
)

echo.
pause
