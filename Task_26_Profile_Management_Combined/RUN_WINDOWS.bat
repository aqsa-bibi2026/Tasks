@echo off
if not exist .env (
 echo ERROR: .env missing
 echo Run: Copy-Item .env.example .env
 pause
 exit /b 1
)
npm run dev
pause
