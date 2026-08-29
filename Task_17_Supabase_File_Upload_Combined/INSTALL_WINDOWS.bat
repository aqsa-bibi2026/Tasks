@echo off
title Task 17 Install
echo ============================================
echo Task 17 - Supabase File Upload
echo ============================================
call npm install
if errorlevel 1 goto :error
echo.
echo Installation completed successfully.
pause
exit /b 0
:error
echo Installation failed. Make sure Node.js is installed.
pause
exit /b 1
