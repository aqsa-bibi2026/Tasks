@echo off
title Task 13 Install
call npm install
if errorlevel 1 goto :error
call npm run install:all
if errorlevel 1 goto :error
echo Installation complete.
pause
exit /b 0
:error
echo Installation failed. Make sure Node.js is installed.
pause
exit /b 1
