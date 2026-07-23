
@echo off
cd /d "%~dp0"
 
echo ============================================
echo   Pushing data folder changes to GitHub...
echo ============================================
echo.
 
git add data
git commit -m "data update"
 
if errorlevel 1 (
    echo.
    echo Nothing changed. No new data to push.
) else (
    echo.
    echo Pushing to GitHub...
    git push
    echo.
    echo Done! The site will update in 1-2 minutes.
)
 
echo.
pause