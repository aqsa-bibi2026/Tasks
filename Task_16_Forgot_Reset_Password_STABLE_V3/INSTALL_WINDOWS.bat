@echo off
title Task 16 Install
echo ============================================
echo Task 16 - Forgot and Reset Password
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
