@echo off
echo ===================================================
echo Starting EShop Hub (Flask Backend + React Frontend)
echo ===================================================

start "EShop Hub Backend (Flask)" cmd /k "cd backend && python app.py"
start "EShop Hub Frontend (React)" cmd /k "npm run dev"

echo Waiting 3 seconds for servers to initialize...
timeout /t 3 /nobreak >nul
start http://localhost:5176

echo.
echo ===================================================
echo Backend running on:  http://localhost:5001
echo Frontend running on: http://localhost:5176
echo ===================================================
pause
