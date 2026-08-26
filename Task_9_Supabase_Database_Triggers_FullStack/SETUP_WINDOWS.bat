@echo off
echo Installing root dependencies...
call npm install

echo Installing server dependencies...
call npm install --prefix server

echo Installing client dependencies...
call npm install --prefix client

if not exist server\.env copy server\.env.example server\.env
if not exist client\.env copy client\.env.example client\.env

echo.
echo Setup complete.
echo Add your Supabase URL and Publishable Key to server\.env
pause
