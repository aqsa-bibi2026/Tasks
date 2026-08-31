@echo off
title Task 31 LayerDesk
if not exist .env (
 echo Create .env first: Copy-Item .env.example .env
 pause
 exit /b 1
)
call npm run dev
pause
