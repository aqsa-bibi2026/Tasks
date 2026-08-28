@echo off
title Task 12 - Install Dependencies
echo ============================================
echo Task 12 - Custom JWT Authentication
echo Installing dependencies...
echo ============================================
call npm install
if errorlevel 1 goto :error
call npm run install:all
if errorlevel 1 goto :error
echo.
echo Installation completed.
echo Next:
echo 1. Create backend\.env from backend\.env.example
echo 2. Create frontend\.env from frontend\.env.example
echo 3. Run supabase\task_12_setup.sql in Supabase SQL Editor
echo 4. Double-click RUN_WINDOWS.bat
pause
exit /b 0
:error
echo.
echo Installation failed. Make sure Node.js is installed.
pause
exit /b 1
